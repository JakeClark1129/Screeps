/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('behaviours.getResources');
 * mod.thing == 'a thing'; // true
 */

var common = require("behaviours.common");

module.exports = {

};


var getResources_initialize(creep, info)
{
	if (!info ||
		!info.resourceType ||
		(!info.includeHarvesterSpots && !info.includeDropped && !info.includeStorage))
	{
		return false
	}
	if (!info.requiredAmount)
	{
		info.requiredAmount = creep.carryCapacity - _.sum(creep.carry);
	}
	creep.memory.getResources = info;
	return true
}

var getResources(creep)
{
	var state = creep.memory.getResources.state


}
getResources.states = {}
getResources.states.requestResource = common.requestResource
getResources.states.pickUpResource = common.pickUpResource