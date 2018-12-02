var creepManager = require('manager.creeps');
var creepBuilder = require('creepDesigner');
var utils = require('utils');
var roomSetup = require('roomSetup');

var DEBUG = true;

module.exports.loop = function () {

    if (DEBUG)
    {
        console.log("================START LOGGING==================")
	}
	
    if(!Memory.rooms)
    {
        Memory.rooms = {}
    }
    var spawn = Game.spawns.Spawn1
    if (spawn.memory)
    {
        //When we spawn something, we have to set the spawn as reserved because when we try to spawn something new, it will overwrite the previous request
        spawn.memory.reserved = null
    }
    
    creepManager.run()
    
    //CreateFlags for each memory spot
    if (!Memory.rooms[spawn.room.name] || !Memory.rooms[spawn.room.name].sourceFlagsSet)
    {
       roomSetup.setupMinerFlags()
    }
    if (!Memory.rooms[spawn.room.name] || !Memory.rooms[spawn.room.name].controllerFlagSet)
    {
       roomSetup.setupControllerFlag(Game.spawns.Spawn1.room)
    }
    roomSetup.placeExtensions(Game.spawns.Spawn1.room)
    

    if (DEBUG)
    {
        console.log("=================END LOGGING===================")
    }
    
};
