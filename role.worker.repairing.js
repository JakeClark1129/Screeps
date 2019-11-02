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
        var state = creep.memory.repairing.state
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
        case "repairing":
            state = state_repairing(creep);
            break;
        default:
            console.log("Invalid state for role repairer: " + state )
            state = "initializing"
            break;
        }
        
        creep.memory.repairing.state = state

        if (state == "done")
        {
            return "done"
        }
        else if (state == "failed")
        {
            return "failed"
        }
        else
        {
            return "running"
        }
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
    if (creep.memory.repairing.energySourceId == undefined || creep.memory.repairing.energySourceId == null)
    {
        var source = builderManager.getEnergySource(creep)
        if(source)
        {
            creep.memory.repairing.energySourceId = source.id
        }
        else
        {
            creep.memory.repairing.energySourceId = null
        }
    }
    
    if (creep.memory.repairing.energySourceId)
    {
        creep.say("pickingUpResource")
        return "pickingUpResource"
    }
    return "requestingResource"
    
}

var state_pickingUpResource = function(creep)
{
    if (!creep.memory.repairing.energySourceId)
    {
        //We lost the energy source - This should never happen
        creep.say("requestingResource")
        return "requestingResource"
    }
    var energySource = Game.getObjectById(creep.memory.repairing.energySourceId)
    
    //Check if the energy source still exists
    if (energySource == null)
    {
        //We lost the energy source
        creep.memory.repairing.energySourceId = null
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
        creep.memory.repairing.energySourceId = null;
        creep.say("requestingTarget")
        return "requestingTarget"
    }
}

var state_requestingTarget = function(creep)
{
    var target = builderManager.getRepairTarget(creep);
    if (target)
    {
        creep.memory.repairing.targetId = target.id;
    }
    else
    {
        //If we could not find a target, then make sure we clear whatever might have been in memory before this tick
        creep.memory.repairing.targetId = null   
    }
    
    
    if (creep.memory.repairing.targetId)
    {
        creep.say("repairing")
        return "repairing"
    }
    return "requestingTarget"
}

var state_repairing = function(creep)
{
    if (!creep.memory.repairing.targetId)
    {
        creep.say("requestingTarget")
        return "requestingTarget"
    }
    
    var target = Game.getObjectById(creep.memory.repairing.targetId)
    //if the target does not exist, then we assume it was destroyed or finished. Move on
    if (!target)
    {
        creep.say("failed")
        return "failed"
    }
    var result = creep.repair(target)
    if (result == ERR_NOT_IN_RANGE)
    {
        creep.moveTo(target, {reusePath:10})
        return "building"
    }
    else if (result == OK)
    {
        if(creep.carry[RESOURCE_ENERGY] > 0)
        {
            return "repairing"
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
        creep.memory.repairing.targetId = null //Unreliable target, remove it to force us to request a new one later
        creep.say("initializing")
        return "initializing"
    }
}