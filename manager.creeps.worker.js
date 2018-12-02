/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('transportManager');
 * mod.thing == 'a thing'; // true
 */

var 

module.exports = {
    run : function()
    {
        //TODO: This will be the stateManager, that manages the internal state of the creep.
        // building
        // repairing
        // dismantling
        // mining
        // upgrading
    },
    getTarget : function(creep)
    {
        var sites = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
		if (sites)
		{
		    return sites[0]
		}
    },
    
    //Use this to prioritize taking energy from long term storage instead of miners (For builders only)
    getEnergySource : function(requestedAmount, strict)
    {
		var requiredAmount = creep.carryCapacity - _.sum(creep.carry);
		return utils.findBestResourceSource(creep, RESOURCE_ENERGY, requiredAmount, strict, true, true, true)
	},
	reassignRole: function (creep)
	{
		//TODO: Calculate what kind of role is required.qq	
	}
};