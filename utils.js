/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */


module.exports = {
	calcuateTotalTicksToTraversePath: calcuateTotalTicksToTraversePath,

	findBestResourceSource: function (creep, resourceType, amount, strict, includeHarvesterSpots, includeDropped, includeStorage )
	{
		var resourceSources = []
		/*  resourceSource = {
			pos : {x, y},
			amount,
			travelCost, //based off value off of total fatigue points accumilated
			source, //Reference to the actual source for the transporter to use
			}
		 */
		if (includeHarvesterSpots)
		{
			//TODO: We need to add an extra layer to the miner spots to allow us to filter the type of resouce being mined
			var minerSpots = Memory.rooms[creep.room.name].minerSpots;
			for (var minerSpotIndex in minerSpots)
			{
				var minerSpot = minerSpots[minerSpotIndex]

				//Determine the amount of resource Available at the minerSpot
				var resourceAmount = 0;
				var resourceSourceObj = null
				if (minerSpot.containerId != null && minerSpot.containerId != undefined)
				{
					resourceSourceObj = Game.getObjectById(minerSpot.containerId)
					if (resourceSourceObj == null)
					{
						minerSpot.containerId = null
					}
				}
				else
				{
					structures = creep.room.lookForAt(LOOK_STRUCTURES, minerSpot.pos.x, minerSpot.pos.y)
					var found = false;
					if (structures.length > 0)
					{
						for(var i in structures)
						{
							if (structures[i].structureType == STRUCTURE_CONTAINER)
							{
								minerSpot.containerId = structures[i].id;
								found = true
							}
						}
					}
					if (!found)
					{
						creep.room.createConstructionSite(minerSpot.pos.x, minerSpot.pos.y, STRUCTURE_CONTAINER)
					}
				}
				if (resourceSourceObj)
				{
					resourceAmount = resourceSourceObj.store[resourceType]
				}
				else
				{
					//TODO: We need to add an extra layer to the miner spots to allow us to filter the type of resouce being mined
					var droppedResource = creep.room.lookForAt(LOOK_ENERGY, minerSpot.pos.x, minerSpot.pos.y);
					console.log("Length: " + droppedResource.length)
					if (droppedResource.length > 0)
					{
						resourceAmount = droppedResource[0].amount
						resourceSourceObj = droppedResource[0]
						console.log("DropedEnerguId: " + droppedResource[0].id)
					}
				}

				//If the creep is strictly requesting only sources that can fill him up, then no sense in adding it to the list.
				if (strict && resourceAmount < amount)
				{
					continue
				}

				//Determine the total amount of ticks it will take to travel to the resource source
				var path = creep.pos.findPathTo(minerSpot.pos.x, minerSpot.pos.y, { ignoreCreeps: true, range: 1 });
				var totalTicks = calcuateTotalTicksToTraversePath(creep, path)
				console.log("totalTicks: " + totalTicks)


				//Build the resource source object
				var resourceSource = {}
				resourceSource.pos = minerSpot.pos
				resourceSource.amount = resourceAmount
				resourceSource.travelCost = totalTicks
				resourceSource.source = resourceSourceObj
				//Add resource source oobject to a list so we can determine the best choice later.
				resourceSources.push(resourceSource)
			}
		}

		//Note: This can also include harvesterSpots, or ControllerUpgradeSpots if the container is overflowed or missing.
		if (includeDropped)
		{
		    var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES,
                { 
                    filter: function(item)
                    {
                        return item.resourceType == RESOURCE_ENERGY && item.amount > 40; // 40 is temp value. make smarter
                    }
                });
            console.log("DROPPEDRESOURECES: " + droppedResources.length)
			for (var index in droppedResources)
			{
				var droppedResource = droppedResources[index]

				//If the creep is strictly requesting only sources that can fill him up, then no sense in adding it to the list.
				if (strict && droppedResource.amount < amount)
				{
					continue
				}

				//Determine the total amount of ticks it will take to travel to the resource source
				var path = creep.pos.findPathTo(droppedResource.pos.x, droppedResource.pos.y, { ignoreCreeps: true, range: 1 });
				var totalTicks = calcuateTotalTicksToTraversePath(creep, path)
				console.log("totalTicks: " + totalTicks)

				//Build the resource source object
				var resourceSource = {}
				resourceSource.pos = droppedResource.pos
				resourceSource.amount = droppedResource.amount
				resourceSource.travelCost = totalTicks
				resourceSource.souce = droppedResource
				//Add resource source oobject to a list so we can determine the best choice later.
				resourceSources.push(resourceSource);
			}
		}

		if (includeStorage)
		{
			var storageContainer = creep.room.storage
			if (storageContainer != undefined)
			{
				//If the creep is strictly requesting only sources that can fill him up, then no sense in adding it to the list.
				if (!strict || storageContainer.store[resouceType] >= amount)
				{

					//Determine the total amount of ticks it will take to travel to the resource source
					var path = creep.pos.findPathTo(droppedResource.pos.x, droppedResource.pos.y, { ignoreCreeps: true, range: 1 });
					var totalTicks = calcuateTotalTicksToTraversePath(creep, path)
					console.log("totalTicks: " + totalTicks)

					//Build the resource source object
					var resourceSource = {}
					resourceSource.pos = storageContainer.pos
					resourceSource.amount = storageContainer.store[resouceType]
					resourceSource.travelCost = totalTicks
					resourceSource.source = storageContainer
					//Add resource source oobject to a list so we can determine the best choice later.
					resourceSources.push(resourceSource)
				}

			}
		}

		//Calculate the most valuable source
		var index = 0
		var maxValue = 0;
		console.log("=======================================")
		for (resourceSourceIndex in resourceSources)
		{
			var source = resourceSources[resourceSourceIndex]
			//This assumes that the creep is not carrying any other resources
			var fullness = Math.min(source.amount / amount, 1)

			console.log("Required Amount: " + amount)
			console.log("Source Amount: " + source.amount)


			//OverflowOffset is to add a bit of an edge to resourceSources that are fuller than others
			var overflowOffset = Math.max((source.amount / amount) - 1, 0)
			console.log("overflowOffset: " + overflowOffset)


			// Calculte the value of this source. Value is primarily based off of the relationship between distance and 
			// amount of resource. However, an extra bit was added to prefer over full resource patches.
			var value = (fullness / source.travelCost) + (overflowOffset / (source.travelCost * 2));
			console.log("value" + resourceSourceIndex + ": " + value)
			if (value > maxValue)
			{
				index = resourceSourceIndex
				maxValue = value
			}
			console.log("--------------------------------")
		}
		console.log("=======================================")

		if (resourceSources.length > 0)
		{
			return resourceSources[index].source
		}
		return null
	}
};

var calcuateTotalTicksToTraversePath = function (creep, path)
{
	var totalTicks = 0
	for (var step in path)
	{
		var tileMultiplier = calculateTileFatigueMultiplier(step.x, step.y, creep.room);
		var creepInfo = calculateCreepInfo(creep);

		var fatigue = creepInfo.heavyParts * tileMultiplier;
		//HACK: If we generate no fatigue we can still only move 1 tile per tick.
		if (fatigue == 0)
		{
			fatigue = 1;
		}
		totalTicks += Math.ceil(fatigue / (creepInfo.moveParts * 2));
	}
	return totalTicks;
}

var calculateTileFatigueMultiplier = function (posX, posY, room)
{
	var items = room.lookAt(posX, posY)
	//Assume swamp
	var tileCost = 10
	for (var index in items)
	{
		var item = items[index];
		if (item.type == "road")
		{
			tileCost = 1
			break;
		}
		else if (item.type == "terrain")
		{
			if (item.terrain == "plain")
			{
				tileCost = 2
			}
			else if (item.terrain == "swamp")
			{
				tileCost = 10;
			}
		}
	}
	return tileCost
}

var calculateCreepInfo = function (creep)
{
	var heavyParts = 0
	var moveParts = 0
	for (var i in creep.body)
	{
		var bodyPart = creep.body[i]
		if (bodyPart.type == MOVE)
		{
			++moveParts
		}
		else if (bodyPart.type != CARRY)
		{
			++heavyParts;
		}
	}
	//Calculate amount of active carry parts. (Carry parts only have weight if they are carrying energy)
	heavyParts += Math.ceil(creep.carry[RESOURCE_ENERGY] / CARRY_CAPACITY)

	var creepInfo = {
		heavyParts: heavyParts,
		moveParts: moveParts
	}
	return creepInfo
}