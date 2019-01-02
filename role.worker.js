/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
var builderManager = require('manager.creeps.worker')

/* The worker is a general purpose creep that does everything. However it is primarily
 * used as a builder/repair creep as they have no specifically designed creeps.
 */
var roleBuilding = require('role.worker.building')

/*var roleUpgrading = require('role.worker.repairing')
var roleUpgrading = require('role.worker.upgrading')
var roleUpgrading = require('role.worker.mining')
var roleUpgrading = require('role.worker.transporting')
var roleUpgrading = require('role.worker.building')
var roleUpgrading = require('role.worker.dismantling')*/


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
            state = self.initializing(creep);
            break;
        case "requestingJob":
            state = self.requestingJob(creep);
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



var state_initializing = function(creep)
{
    if(!creep.spawning)
    {
        creep.say("requestingResource")
        return "requestingResource"
    }
    return "initializing"
}

var state_requestingJob = function(creep)
{
    creep.memory.state = "building"
    return "running" 
}