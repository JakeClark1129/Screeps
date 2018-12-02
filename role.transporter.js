/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
var transporterManager = require('manager.creeps.transporter')



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
		var source = transporterManager.getEnergySource(creep)
		console.log("Source: " + source)
        if(source)
        {
			creep.memory.energySourceId = source.id
			console.log("Source ID: " + source.id)
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
	var target = transporterManager.getTarget(creep);
    if (target)
    {
        if (target instanceof RoomPosition )
        {
            //We should drop energy at this location
            creep.memory.targetId = target;
            creep.memory.isPos = true;
        }
        else
        {
            //An object we can call transfer on.
            creep.memory.targetId = target.id;
            creep.memory.isPos = false;
        }
    }
    else
    {
        //If we could not find a target, then make sure we clear whatever might have been in memory before this tick
        creep.memory.targetId = null   
    }
    
    
    if (creep.memory.targetId)
    {
        creep.say("deliveringResource")
        return "deliveringResource"
    }
    return "requestingTarget"
}

var state_deliveringResource = function(creep)
{
    if (!creep.memory.targetId)
    {
        creep.say("requestingTarget")
        return "requestingTarget"
    }
    
    if(creep.memory.isPos)
    {
        if (creep.pos.x == creep.memory.targetId.x && creep.pos.y == creep.memory.targetId.y)
        {
            creep.drop(RESOURCE_ENERGY)
            creep.say("requestingResource")
            return "requestingResource"
        }
        else
        {
            creep.moveTo(creep.memory.targetId.x,creep.memory.targetId.y , {reusePath:10})
        }
    }
    else
    {
        var target = Game.getObjectById(creep.memory.targetId)
        //if the target does not exist
        if (!target)
        {
            creep.say("requestingTarget")
            return "requestingTarget"
        }
        if (target.energy == target.energyCapacity)
        {
        	creep.say("requestingTarget")
        	return "requestingTarget"
        }
        var result = creep.transfer(target, RESOURCE_ENERGY)
        if (result == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(target, {reusePath:10})
            return "deliveringResource"
        }
        else if (result == OK)
        {
        	/* The carry of the creep is not updated until the next tick. 
        	 * so we calcualate the amount of energy the creep transferred 
        	 * and subtract it from this ticks energy
			 */
        	var amount = target.energyCapacity - target.energy
            if(creep.carry[RESOURCE_ENERGY] - amount > 0)
            {
                creep.say("requestingTarget")
                return "requestingTarget"
            }
            else
            {
                creep.say("requestingResource")
                return "requestingResource"
            }
        }
        else
        {
			console.log("Something horrible has happened and a creep cannot deliver its resources. Transfer result: " + result)
            creep.memory.targetId = null //Unreliable target, remove it so we can request a new one later
            creep.say("initializing")
            return "initializing"
        }
    }
    return "deliveringResource"
}


module.exports = {
    run : function(creep)
    {
        //Assume the correct creep was passed it
        var state = creep.memory.state
        switch (state)
        {
        case "initializing":
            state = this.states.initializing(creep);
            break;
        case "requestingResource":
            state = this.states.requestingResource(creep);
            break;
        case "pickingUpResource":
            state = this.states.pickingUpResource(creep);
            break;
        case "requestingTarget":
            state = this.states.requestingTarget(creep);
            break;
        case "deliveringResource":
            state = this.states.deliveringResource(creep);
            break;
        default:
            console.log("Invalid state for role miner: " + state )
            state = "initializing"
            break;
        }
        
        creep.memory.state = state
    },
    states : {
        initializing : state_initializing,
        requestingResource : state_requestingResource,
        pickingUpResource : state_pickingUpResource,
        requestingTarget : state_requestingTarget,
        deliveringResource : state_deliveringResource
    }
};

