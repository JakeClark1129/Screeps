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
        //TODO: This should return the next source from the list, but right now we only have one source.
		var extension = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity}
        });
        if (extension)
        {
            return extension
        }

        var flag = Game.flags[Game.spawns.Spawn1.room.name + "-controller"]

        if (flag.memory && flag.memory.containerId)
        {
            var container = Game.getObjectById(flag.memory.containerId)
            if (container == null)
            {
                //it died
                flag.memory.containerId = null
                return flag.pos
            }
            return container
        }
        else
        {
            return flag.pos
        }
    },

    getEnergySource : function(creep)
	{
		var requiredAmount = creep.carryCapacity - _.sum(creep.carry);
		return utils.findBestResourceSource(creep, RESOURCE_ENERGY, requiredAmount, false, true)
    },
};