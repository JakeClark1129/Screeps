
var minerManager = require('manager.creeps.miner');
var transporterManager = require('manager.creeps.transporter');

var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var creepBuilder = require('creepDesigner');

var MAX_TRANSPORTERS = 2;

//Workers is any creep that spend energy. TODO: Base this number off of energy available to the room.
var MAX_WORKERS = 2 
var MAX_UPGRADERS = 0;
var MAX_BUILDERS = 0;
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
    if (sites)
    {
        MAX_BUILDERS = sites.length/3
        if (MAX_BUILDERS > (MAX_WORKERS - 1))
        {
            MAX_BUILDERS = MAX_WORKERS - 1
        }
    }
    //MAX_UPGRADERS = MAX_WORKERS - MAX_BUILDERS
    MAX_UPGRADERS = 2;
    var minerCount = 0;
    var transporterCount = 0;
    var upgraderCount = 0;
    var builderCount = 0;
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
                case "builder":
                    roleBuilder.run(creep)
                    ++builderCount
                break;
            }
        }
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
    if(transporterCount < MAX_TRANSPORTERS)
    {
        creepBuilder.buildCreep(creepBuilder.ROLE_TRANSPORTER, budget )
    }
    if(upgraderCount < MAX_UPGRADERS)
    {
        creepBuilder.buildCreep(creepBuilder.ROLE_UPGRADER, budget )
    }
    if(builderCount < MAX_BUILDERS)
    {
        creepBuilder.buildCreep(creepBuilder.ROLE_BUILDER, budget )
    }
    
}
    
module.exports = {
    run : run
};

