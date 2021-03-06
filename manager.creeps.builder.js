/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('transportManager');
 * mod.thing == 'a thing'; // true
 */
var utils = require("utils")
module.exports = {
    run : function()
    {
        //TODO: Get list of structures requiring energy from transport manager
    },
    getTarget : function(creep)
    {
        var sites = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
        if (sites)
        {
            return sites[0]
        }
    },
    //TODO: Make this function account for distance, and current health of the structure.
    getRepairTarget : function(creep)
    {
        //All valid structures.
        var targets = creep.room.find(FIND_STRUCTURES, {filter : (structure) => {
            return structure.hitsMax * 0.75 >= structure.hits 
        }});

        targets.sort((a, b) => {
            a.hits / a.hitsMax - b.hits / b.hitsMax
        })

        return targets[0]
    },
    //Use this to prioritize taking energy from long term storage instead of miners (For builders only)
    getEnergySource : function(creep)
    {
		var requiredAmount = creep.carryCapacity - _.sum(creep.carry);
		return utils.findBestResourceSource(creep, RESOURCE_ENERGY, requiredAmount, false, true, true, true)
    },
};