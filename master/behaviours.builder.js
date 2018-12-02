/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('behaviours.builder');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
	behaviours: {
		requestingConstructionSite: requestingConstructionSite,
		build: build,
	},
};

var requestingConstructionSite_initialize = function (creep, info)
{
	//There are not pre-conditions for this behavior
	return true;
}

var requestingConstructionSite = function (creep)
{
	var ret = { transition: null, info: null };

	var target = builderManager.getTarget();

	if (target)
	{
		ret.info.target = target.id
		ret.transition = "done"
	}
	else
	{
		//TODO: Do we allow this task to take multiple ticks, or should this fail?
		ret.transition = "running"
	}

	return ret
}
requestingConstructionSite.initialize = requestingConstructionSite_initialize;

var build_initialize = function (creep, info)
{
	//Validate Pre-Conditions:
	if (!info ||
		!info.targetId ||
		creep.carry[RESOURCE_ENERGY] == 0)
	{
		//Pre-conditions not met
		return false
	}

	//Initialize the Memory to clear out any previously set values.
	creep.memory.build = {}
	creep.memory.build.targetId = info.targetId
	return true
}

var build = function (creep)
{
	var buildInfo = creep.memory.build
	var ret = { transition: null, info: null };
	var target = Game.getObjectById(buildInfo.targetId)

	//if the target does not exist, that can mean a few things. But either way, we are done with this task.
	if (!target)
	{
		creep.say("done")
		ret.transition = "done"
		return ret
	}
	var result = creep.build(target)
	if (result == ERR_NOT_IN_RANGE)
	{
		creep.moveTo(target, { reusePath: 10 })
		ret.transition = "running"
		return ret
	}
	else if (result == OK)
	{
		//TODO: Check the target construction sites progress, to see if this tick will finish it, to accurately return a 'done' transition
		ret.transition = "running"
		return ret
	}
	else if (result == ERR_NOT_ENOUGH_RESOURCES)
	{
		creep.say("out_of_energy")
		ret.transition = "out_of_energy"
		return ret
	}
	else
	{
		creep.say("failed")
		ret.transition = "failed"
		return ret
	}
}
build.initialize = build_initialize