/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */


defenderManager = require("manager.creeps.defender")

var state_initializing = function (creep)
{
	if (!creep.spawning)
	{
		return "requestingTarget"
	}
	return "initializing"
}

var state_pursuit = function (creep)
{
	if (!creep.memory.targetId)
	{
		return "requestingTarget"
	}
	console.log("Target: " + creep.memory.targetId)
	var target = Game.getObjectById(creep.memory.targetId)
	if (target == null || target == undefined)
	{
		creep.memory.targetId == undefined
		return "requestingTarget"
	}

	var result = creep.attack(target)
	if (result == ERR_INVALID_TARGET)
	{
		creep.memory.targetId == undefined
		return "requestingTarget"
	}
	else if(result == ERR_NOT_IN_RANGE)
	{
		creep.moveTo(target)
	}
	else
	{
		console.log("Broken Defender Creep. Investigate further...")
	}
	return "pursuit"
}

var state_requestingTarget = function(creep)
{
	target = defenderManager.requestTarget(creep)
	if (target)
	{
		creep.memory.targetId = target.id
		return "pursuit"
	}
	return "requestingTarget"
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
        case "pursuit":
            state = this.states.state_pursuit(creep);
            break;
        case "requestingTarget":
            state = this.states.requestingTarget(creep);
            break;
        default:
            console.log("Invalid state for role defender: " + state )
            state = "initializing"
            break;
        }
        creep.memory.state = state
        return state
	},
	states: {
		initializing: state_initializing,
		pursuit: state_pursuit,
		requestingTarget: state_requestingTarget,
	}
};