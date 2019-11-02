
var minerManager = require('manager.creeps.miner');
var transporterManager = require('manager.creeps.transporter');

var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');
var roleUpgrader = require('role.upgrader');
var roleWorker = require('role.worker');
var roleDefender = require('role.defender');
var creepBuilder = require('creepDesigner');

var MAX_TRANSPORTERS = 2;

//Workers is any creep that spend energy. TODO: Base this number off of energy available to the room.
var MAX_WORKERS = 2
var MAX_UPGRADERS = 0;

var run = function()
{
    for(var i in Memory.creeps)
    {
        if(!Game.creeps[i])
        {
            delete Memory.creeps[i];
        }
    }
    var sites = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);

    sites = sites.concat(Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {filter : (structure) => {
        return structure.hitsMax * 0.70 >= structure.hits
    }}));

    if (sites)
    {
        MAX_WORKERS = sites.length/3
    }
    MAX_UPGRADERS = 2;
    if (Game.spawns['Spawn1'].room.controller.level == 8)
    {
        MAX_UPGRADERS = 1;
        creepBuilder.UPGRADER_MAX_EXTENSIONS = 14;
    }
    var minerCount = 0;
    var transporterCount = 0;
    var upgraderCount = 0;
    var workerCount = 0;
    var defenderCount = 0;
    //Make all creeps do their thing
    for(var creepName in Game.creeps)
    {
        var creep = Game.creeps[creepName];
        if (creep.memory)
        {
            switch(creep.memory.role)
            {
                case "miner":
                    roleMiner.run(creep)
                    ++minerCount;
                break;
                case "transporter":
                    roleTransporter.run(creep)
                    ++transporterCount
                break;
                case "upgrader":
                    roleUpgrader.run(creep)
                    ++upgraderCount
                break;
                case "worker":
                    roleWorker.run(creep)
					++workerCount
				break;
                case "defender":
                    roleDefender.run(creep)
                    ++defenderCount
                break;
            }
        }
	}
	var defendersRequired = 0
	var enemyCreeps = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
	if (enemyCreeps)
	{
		defendersRequired = 1
	}
    /*
     * Creeps get built in the order that we attempt to build them in. MINER and TRANSPORTER creeps should be at the top so we have a constant flow of energy
    */
    var budget = Game.spawns.Spawn1.room.energyCapacityAvailable
    if(transporterCount == 0 || minerCount == 0)
    {
        //Prevent us trying to build a creep we will never have enough resources for.
        budget = Game.spawns.Spawn1.room.energyAvailable
    }
    //Run managers to handle creating new creeps and other things.
    minerManager.run(budget)
    if(defenderCount < defendersRequired)
    {
		creepBuilder.buildCreep(creepBuilder.ROLE_DEFENDER, budget )
		console.log("Build Defender.")
    }
    if(transporterCount < MAX_TRANSPORTERS)
    {
        creepBuilder.buildCreep(creepBuilder.ROLE_TRANSPORTER, budget )
    }
    if(upgraderCount < MAX_UPGRADERS)
    {
        creepBuilder.buildCreep(creepBuilder.ROLE_UPGRADER, budget )
    }
    if(workerCount < MAX_WORKERS)
    {
        creepBuilder.buildCreep(creepBuilder.ROLE_WORKER, budget )
    }

}

module.exports = {
    run : run
};
