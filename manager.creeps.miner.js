/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('minerManager');
 * mod.thing == 'a thing'; // true
 */
var creepBuilder = require('creepDesigner');

module.exports = {
    run : function(budget)
    {
        var allFlags = Game.flags
        for (var room in Memory.rooms)
        {
        	for (var minerSpotIndex in Memory.rooms[room].minerSpots)
        	{
        		var minerSpot = Memory.rooms[room].minerSpots[minerSpotIndex]
        		var miner = minerSpot.minerName
        		if (miner != undefined && miner != null)
        		{
        			miner = Game.creeps[miner]
        			//The creep is dead
        			if (miner == null || miner == undefined) {
        				minerSpot.minerName = null
        			}
        		}

        		//If there is no miner, then we should spawn a new one
        		if (miner == undefined || miner == null) {
        			//TODO: add miner to screep queue (Should be #1 priority) instead of spawning it here
        			var result = creepBuilder.buildCreep(creepBuilder.ROLE_MINER, budget, { 'minerSpot': minerSpotIndex })
        			//Success
        			if (result != null) {
        				//The creep does not exist until the next tick, so store the name instead of the id
        				minerSpot.minerName = result
        			}
        		}
        		
        		if (minerSpot.containerId == null || minerSpot.containerId == null)
        		{
        			var pos = new RoomPosition(minerSpot.pos.x, minerSpot.pos.y, room)
				}

			}
        }
    }
};