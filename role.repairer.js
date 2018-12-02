/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
var builderManager = require('manager.creeps.builder')


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
        case "requestingResource":
            state = state_requestingResource(creep);
            break;
        case "pickingUpResource":
            state = state_pickingUpResource(creep);
            break;
        case "requestingTarget":
            state = state_requestingTarget(creep);
            break;
        case "building":
            state = state_building(creep);
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
        creep.say("requestingResource")
        return "requestingResource"
    }
    return "initializing"
}


var state_requestingResource = function(creep)
{
    if (creep.memory.energySourceId == undefined || creep.memory.energySourceId == null)
    {
        var source = builderManager.getEnergySource(creep.carryCapacity - creep.energyAvailable)
        if(source)
        {
            creep.memory.energySourceId = source.id
        }
        else
        {
            creep.memory.energySourceId = null
        }
    }
    
    if (creep.memory.energySourceId)
    {
        creep.say("pickingUpResource")
        return "pickingUpResource"
    }
    return "requestingResource"
    
}

var state_pickingUpResource = function(creep)
{
    if (!creep.memory.energySourceId)
    {
        //We lost the energy source - This should never happen
        creep.say("requestingResource")
        return "requestingResource"
    }
    var energySource = Game.getObjectById(creep.memory.energySourceId)
    
    //Check if the energy source still exists
    if (energySource == null)
    {
        //We lost the energy source
        creep.memory.energySourceId = null
        creep.say("requestingResource")
        return "requestingResource"
    }
    
    var result = creep.pickup(energySource)
    console.log("Pickup result: " + result)
    if (result == ERR_NOT_IN_RANGE)
    {
        creep.moveTo(energySource, {reusePath:20})
        return "pickingUpResource"
    }
    else
    {
        creep.memory.energySourceId = null;
        creep.say("requestingTarget")
        return "requestingTarget"
    }
}

var state_requestingTarget = function(creep)
{
    var target = builderManager.getTarget();
    if (target)
    {
        creep.memory.targetId = target.id;
    }
    else
    {
        //If we could not find a target, then make sure we clear whatever might have been in memory before this tick
        creep.memory.targetId = null   
    }
    
    
    if (creep.memory.targetId)
    {
        creep.say("building")
        return "building"
    }
    return "requestingTarget"
}

var state_building = function(creep)
{
    if (!creep.memory.targetId)
    {
        creep.say("requestingTarget")
        return "requestingTarget"
    }
    
    
    var target = Game.getObjectById(creep.memory.targetId)
    //if the target does not exist
    if (!target)
    {
        creep.say("requestingTarget")
        return "requestingTarget"
    }
    var result = creep.build(target)
    if (result == ERR_NOT_IN_RANGE)
    {
        creep.moveTo(target, {reusePath:10})
        return "building"
    }
    else if (result == OK)
    {
        if(creep.carry[RESOURCE_ENERGY] > 0)
        {
            return "building"
        }
        else
        {
            creep.say("requestingResource")
            return "requestingResource"
        }
    }
    else if(result == ERR_NOT_ENOUGH_RESOURCES)
    {
        creep.say("requestingResource")
        return "requestingResource"
    }
    else
    {
        creep.memory.targetId = null //Unreliable target, remove it to force us to request a new one later
        creep.say("initializing")
        return "initializing"
    }
    return "building"
}


