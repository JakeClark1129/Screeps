/*
 * Every Behaviour will have pre-conditions, and post conditions.
 * Pre-conditions: Define what is required in order for the behavior to start processing. Ex: a 'Build' behaviour would require you to have energy, and have a contstructionSite.
 * Post-conditions: Define the expected result of when the behavior is done. A behavior can have multiple post-conditions, Ex: the 'Build' behaviour will have 2 post-conditions. 
 *		1) Out of Energy - The creep ran out of energy, so it can no longer build
 *		2) Building Complete - The creep finished building the structure.
 *		
 *	Each Post-condition will have a corresponding 'transition'. 
 *	In the example above, the transitions would be as follows:
 *		1) Needs Energy - For the 'Out Of Energy' Post Condition.
 *		2) Done - For the 'Building Complete' post-condition. 
 *		
 *		While no post-condition is met, the transition returned will be 'running'
 *		
 *	Handling Errors: If a behaviour fails, it will return a 'failed' transition. Ex; an enemy player destroys the construction site being built so it no longer exists.
 *	
 *	Dealing with Transitions: Each BehaviorTree will be responsible for dealing with each transition returned by the behaviours. If a behaviour fails, it is up 
 *	to the behavior tree to decide how to handle it. Ex: For a 'BuildStructure' behaviour tree, if the 'build' behaviour fails, it could simply exit the behaviour 
 *	tree as-if the behaviour tree finished successfully. Or if the 'build' behaviour returns the 'Needs Energy' transition, then the behavior Tree would switch the behavior to Get Energy.
 *	
 *	Nesting behavior trees: Each behaviour tree will have common sequences of behaviors that are required in multiple other behaviour trees. Ex: Picking up resources would be needed in
 *	both a 'BuildStructure', and a 'RepairStructure' behavior tree. 
 *	To nest a behavior tree, simply add it to your existing behaviour tree as if it were a behavior. This means that each behaviour tree will have to return transitions of it own. 
 *	Most will only have 'running', 'done', and 'failed' transitions.
 */

module.exports = {
	behaviours: {
		requestResource: requestResource,
		pickUpResource: pickUpResource,
		travel: travel,
	},
};

var pickUpResource_initialize = function (creep, info)
{
	if (!info ||
		!info.resourceId)
	{
		return false
	}
	creep.memory.pickUpResource = { resourceId: info.resourceId };
	return true
}

var pickUpResource = function (creep)
{
	var resource = Game.getObjectById(creep.memory.pickUpResource.resourceId)

	if (resource == null)
	{
		//We lost the energy source
		creep.say("failed");
		return "failed"
	}

	var result = creep.pickup(resource)
	if (result == ERR_NOT_IN_RANGE)
	{
		creep.moveTo(resource, { reusePath: 20 })
		return "running"
	}
	else if (result == OK)
	{
		creep.say("done")
		return "done"
	}
	else
	{
		creep.say("failed")
		return "failed"
	}
 
}
pickUpResource.initialize = pickUpResource_initialize;

var requestResource_initialize = function (creep, info)
{
	//Validate Pre-Conditions:
	if (!info ||
		!info.resourceType ||
		!info.requiredAmount ||
		(!info.includeHarvesterSpots && !info.includeDropped && !info.includeStorage))
	{
		//Pre-conditions not met
		return false
	}

	//Set default values
	if (!info.strict)
	{
		//We do not care if the resource is how much we are requesting.
		info.strict = false;
	}

	if (!info.includeHarvesterSpots)
	{
		info.harvesterSpots = false
	}

	if (!info.includeDropped)
	{
		info.includeDropped = false
	}

	if (!info.includeStorage)
	{
		info.includeStorage = false
	}

	creep.memory.build = info
	return true

}

var requestResource = function (creep)
{
	var ret = { transition: null, info: {} };

	var requestResourceInfo = creep.memory.requestResource;

	var source = utils.findBestResourceSource(creep, 
		requestResourceInfo.resourceType,
		requestResourceInfo.requiredAmount,
		requestResourceInfo.strict,
		requestResourceInfo.includeHarvesterSpots,
		requestResourceInfo.includeDropped,
		requestResourceInfo.includeStorage); 

	if (source)
	{
		ret.info.sourceId = source.id
		ret.transition = "done"
	}
	else
	{
		ret.transition = "running"
	}
	return ret
}
requestResource.initialize = requestResource_initialize;

var travel_initialize = function (creep, info)
{
	//Validate Pre-Conditions:
	if (!info ||
		!info.destination ||
		!info.destination.x ||
		!info.destination.y)
	{
		//Pre-conditions not met
		return false
	}
	//If there is no roomName passed in, assume the creeps current room.
	if (!info.destination.roomName)
	{
		info.destination.roomName = creep.roomName
	}

	//Initialize the Memory to clear out any previously set values.
	creep.memory.travel = {}

	//How close we need to get to the target. If none, assume 0
	if (info.range)
	{
		creep.memory.travel.range = info.range;
	}
	else
	{
		creep.memory.travel.range = 0;
	}
	
	creep.memory.travel.destination = info.destination
	return true
}

var travel = function (creep)
{
	var travelInfo = creep.memory.travel
	var target = new RoomPosition(travelInfo.destination.x, travelInfo.destination.y, travelInfo.destination.roomName)
	if (!creep.pos.inRangeTo(target, travelInfo.range))
	{
		var result = creep.moveTo(target, { reusePath: 20 })
		if (result == OK || result == ERR_TIRED)
		{
			return "running"
		}
		else
		{
			return "failed"
		}
	}
	else
	{
		creep.memory.travelInfo = undefined
		creep.say("done")
		return "done"
	}
}
travel.initialize = travel_initialize;