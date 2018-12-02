/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */



module.exports = {
    run : function(creep)
    {
        //Assume the correct creep was passed it
        var state = creep.memory.state
        switch (state)
        {
        case "initializing":
            state = state_initializing(creep);
            break;
        case "travelling":
            state = state_travelling(creep);
            break;
        case "upgrading":
            state = state_upgrading(creep);
            break;
        default:
            console.log("Invalid state for role miner: " + state )
            state = "initializing"
            break;
        }
        creep.memory.state = state
    }
};


var state_initializing = function(creep)
{
    if(!creep.spawning)
    {
        creep.say("travelling")
        return "travelling"
    }
    return "initializing"
}

var state_travelling = function(creep)
{
    var target = Game.flags[creep.room.name + "-controller"]    
    
    if (!creep.pos.isNearTo(target.pos))
    {
        creep.moveTo(target, {reusePath:20})
        return "travelling"
    }
    else
    {
        creep.say("upgrading")
        return "upgrading"
    }
}


var state_upgrading = function(creep)
{
    var controller = creep.room.controller;
    if (creep.carry.energy < creep.carryCapacity/2)
    {
        var flag = Game.flags[creep.room.name + "-controller"]
        var container = Game.getObjectById(flag.memory.containerId)
        if (container)
        {
            creep.withdraw(container, RESOURCE_ENERGY)
        }
        else
        {
            flag.memory.containerId = null;
			var resources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)
			for (var resource in resources)
			{
				if (resources[resource].resourceType == RESOURCE_ENERGY)
				{
					creep.pickup(resources[resource]);
				}
			}
        }
    }
    var result = creep.upgradeController(controller)
    if (result == ERR_NOT_IN_RANGE)
    {
        creep.say("travelling")
        return "travelling"
    }
    return "upgrading"
}


