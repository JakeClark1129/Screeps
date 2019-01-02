/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */


var state_initializing = function (creep)
{
	if (!creep.spawning)
	{
		console.log("creep: " + creep )
		var minerSpot = Memory.rooms[creep.room.name].minerSpots[creep.memory.minerSpot]
		creep.memory.sourceId = minerSpot.sourceId

		creep.say("travelling")
		return "travelling"
	}
	return "initializing"
}

var state_travelling = function (creep)
{
	if (!creep.memory.minerSpot)
	{
		//TODO: Request source
	}
	var minerSpot = Memory.rooms[creep.room.name].minerSpots[creep.memory.minerSpot]
	var target = new RoomPosition(minerSpot.pos.x, minerSpot.pos.y, creep.room.name)
	if (!creep.pos.isEqualTo(target))
	{
		creep.moveTo(target, { reusePath: 20 })
		return "travelling"
	}
	else
	{
		creep.say("mining")
		return "mining"
	}
}


var state_mining = function (creep)
{
	if (!creep.memory.sourceId)
	{
		var minerSpot = Memory.rooms[creep.room.name].minerSpots[creep.memory.minerSpot]
		creep.memory.sourceId = minerSpot.sourceId
	}
	var source = creep.memory.sourceId
	source = Game.getObjectById(source);
	if (creep.harvest(source) == ERR_NOT_IN_RANGE)
	{
		creep.say("travelling")
		return "travelling"
	}
	return "mining"

}

module.exports = {
    run : function(creep)
    {
        //Assume the correct creep was passed it
        var state = creep.memory.state
        switch (state)
        {
        case "initializing":
            state = this.states.initializing(creep);
            break;
        case "travelling":
            state = this.states.travelling(creep);
            break;
        case "mining":
            state = this.states.mining(creep);
            break;
        default:
            console.log("Invalid state for role miner: " + state )
            state = "initializing"
            break;
        }
        creep.memory.state = state
        return state
	},
	states: {
		initializing: state_initializing,
		travelling: state_travelling,
		mining: state_mining,
	}
};