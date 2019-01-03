/* The worker is a general purpose creep that does everything. However it is primarily
 * used as a builder/repair creep as they have no specifically designed creeps.
 */

var builderManager = require('manager.creeps.worker')

var roleBuilding = require('role.worker.building')
var roleRepairing = require('role.worker.repairing')

/*var roleUpgrading = require('role.worker.repairing')
var roleUpgrading = require('role.worker.upgrading')
var roleUpgrading = require('role.worker.mining')
var roleUpgrading = require('role.worker.transporting')
var roleUpgrading = require('role.worker.building')
var roleUpgrading = require('role.worker.dismantling')*/


var state_initializing = function(creep)
{
    if(!creep.spawning)
    {
        creep.say("done")
        return "done"
    }
    return "initializing"
}

var state_requestingJob = function(creep)
{
    //var damagedStructures = creep.room.find(FIND_STRUCTURES, {filter : (structure) => {
    //    return structure.hitsMax * 0.75 >= structure.hits 
    //}});
    var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    var state = null
    if (constructionSites.length > 0)
    {
        state = "building"
    }
    else
    {
        state = "repairing"
    }
    
    //Assigning a value instead of adding to it will ensure previous values are cleaned up.
    creep.memory.state = state
    creep.memory[state] = { state: "initializing" }
    return "running" 
}

module.exports = {
    run : function(creep)
    {
        //Assume the correct creep was passed it
        // building
        // repairing
        // dismantling
        // mining
        // upgrading
        var state = creep.memory.state
        switch (state)
        {
        case "initializing":
            state = this.states.initializing(creep);
            break;
        case "requestingJob":
            state = this.states.requestingJob(creep);
            break;
        case "building":
            state = roleBuilding.run(creep);
            break;
        case "repairing":
            state = roleRepairing.run(creep);
            break;
        case "dismantling":
            state = roleDismantling.run(creep);
            break;
        case "mining":
            state = roleMining.run(creep);
            break;
        case "upgrading":
            state = roleUpgradeing.run(creep);
            break;
        default:
            console.log("Invalid state for role worker: " + state )
            state = "initializing"
            break;
        }
        
        if (state == "running")                         
        {
            //Do nothing
        }
        else if (state == "failed" || state == "done")
        {
            creep.memory.state = "requestingJob"
        }
        else
        {
            //Something went wrong... Go back to initializing state to signal that something went wrong
            creep.memory.state = "initializing"
        }
    },
    states: {
        initializing: state_initializing,
        requestingJob: state_requestingJob,
    }
};

