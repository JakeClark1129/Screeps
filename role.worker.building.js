/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
var roleBuilder = require('role.builder')


module.exports = {
    run : function(creep)
    {
        var state = creep.memory.building.state
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
        case "building":
            state = this.states.building(creep);
            break;
        default:
            console.log("Invalid state for role miner: " + state )
            state = "failed"
            break;
        }
        creep.memory.building.state = state

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
    },
    states: {
        initializing: state_initializing,
        requestingResource: state_requestingResource,
        pickingUpResource: state_pickingUpResource,
        requestingTarget: state_requestingTarget,
        building: state_building,
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
    if (creep.memory.building.energySourceId == undefined || creep.memory.building.energySourceId == null)
    {
        var source = builderManager.getEnergySource(creep.carryCapacity - creep.energyAvailable)
        if(source)
        {
            creep.memory.building.energySourceId = source.id
        }
        else
        {
            creep.memory.building.energySourceId = null
        }
    }
    
    if (creep.memory.building.energySourceId)
    {
        creep.say("pickingUpResource")
        return "pickingUpResource"
    }
    return "requestingResource"
    
}

var state_pickingUpResource = function(creep)
{
    if (!creep.memory.building.energySourceId)
    {
        //We lost the energy source - This should never happen
        creep.say("requestingResource")
        return "requestingResource"
    }
    var energySource = Game.getObjectById(creep.memory.building.energySourceId)
    
    //Check if the energy source still exists
    if (energySource == null)
    {
        //We lost the energy source
        creep.memory.building.energySourceId = null
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
        creep.memory.building.energySourceId = null;
        creep.say("requestingTarget")
        return "requestingTarget"
    }
}

var state_requestingTarget = function(creep)
{
    var target = builderManager.getTarget();
    if (target)
    {
        creep.memory.building.targetId = target.id;
    }
    else
    {
        //If we could not find a target, then make sure we clear whatever might have been in memory before this tick
        creep.memory.building.targetId = null   
    }
    
    
    if (creep.memory.building.targetId)
    {
        creep.say("building")
        return "building"
    }
    return "requestingTarget"
}

var state_building = function(creep)
{
    if (!creep.memory.building.targetId)
    {
        creep.say("requestingTarget")
        return "requestingTarget"
    }
    
    var target = Game.getObjectById(creep.memory.building.targetId)
    //if the target does not exist, then we assume it was destroyed or finished. Move on
    if (!target)
    {
        creep.say("Done")
        return "Done"
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
        creep.memory.building.targetId = null //Unreliable target, remove it to force us to request a new one later
        creep.say("initializing")
        return "initializing"
    }
}


