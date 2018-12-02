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
var roleUpgrading = require('role.worker.building')
var roleUpgrading = require('role.worker.repairing')
var roleUpgrading = require('role.worker.upgrading')
var roleUpgrading = require('role.worker.mining')
var roleUpgrading = require('role.worker.transporting')
var roleUpgrading = require('role.worker.building')
var roleUpgrading = require('role.worker.dismantling')


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
            state = state_initializing(creep);
            break;
        case "building":
            state = state_requestingResource(creep);
            break;
        case "repairing":
            state = state_pickingUpResource(creep);
            break;
        case "dismantling":
            state = state_requestingTarget(creep);
            break;
        case "mining":
            state = state_building(creep);
            break;
        case "upgrading":
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
