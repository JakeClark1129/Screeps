/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('roomSetup');
 * mod.thing == 'a thing'; // true
 */
var memoryManager = require('memoryManager')
module.exports = {
    setupMinerFlags : function()
    {
        var spawn = Game.spawns['Spawn1'];
        var sources = spawn.room.find(FIND_SOURCES);
        var spawnPos = spawn.pos;
        var minerSpots = {}
        for (var i = 0; i < sources.length; ++i)
        {
            var path = spawnPos.findPathTo(sources[i].pos)
            var lastStep = path[path.length - 2]
            spawn.room.createConstructionSite(lastStep.x, lastStep.y, STRUCTURE_CONTAINER)
            
            var minerSpot = {}
            minerSpot.sourceId = sources[i].id
            minerSpot.minerName = null
            minerSpot.containerId = null
            minerSpot.pos = { x:lastStep.x, y:lastStep.y }
			minerSpots[i] = minerSpot
            
        }
        memoryManager.addRoomMemory(spawn.room, 'minerSpots', minerSpots)
        memoryManager.addRoomMemory(spawn.room, 'sourceFlagsSet', true)
    },
    setupControllerFlag : function(room)
    {
        var spawn = Game.spawns['Spawn1'];
        var spawnPos = spawn.pos;
        var path = spawnPos.findPathTo(room.controller.pos)
        
        var lastStep = path[path.length - 3]
        var flagPos = new RoomPosition(lastStep.x, lastStep.y, room.name)
        var flagName = room.name + "-controller"
        var flag = flagPos.createFlag(flagName);
        if (flag == ERR_NAME_EXISTS)
        {
            console.log("Error: Flag " + flagName + " already exists")
        }
        else
        {
        	flag = Game.flags[flag]
        	spawn.room.createConstructionSite(flagPos.x, flagPos.y, STRUCTURE_CONTAINER)
            flag.memory = {}
        }
        memoryManager.addRoomMemory(room, 'controllerFlagSet', true)
    },
    placeExtensions : function(room)
    {
        var count = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return (site.structureType == STRUCTURE_EXTENSION)}}).length
        var completedStructures = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {filter: (site) => {return (site.structureType == STRUCTURE_EXTENSION)}}).length
        var max = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level]
        var amount = max - count - completedStructures
        var spawn = Game.spawns['Spawn1']
        
        var center = spawn.pos
        var count = 0;
        for(var i = 1; count < amount; ++i){//Typically you use the variable defined in the for loop in the check, is this ok?
            var remainder = i % 2
            for(var x1 = -i; x1 < i; ++x1){
                if(count < amount && Math.abs(x1) % 2 == remainder){
                    var posX = center.x + x1;
                    var posY = center.y - i;
                    var ret = spawn.room.createConstructionSite(posX, posY, STRUCTURE_EXTENSION);
                    console.log("Ret: " + ret)
                    if (ret == OK){
                        ++count
                    }
               }
            }
            for(var y1 = -i; y1 < i; ++y1){
                if(count < amount && Math.abs(y1) % 2 == remainder){
                    var posX = center.x + i;
                    var posY = center.y + y1;
                    var ret = spawn.room.createConstructionSite(posX, posY, STRUCTURE_EXTENSION);
                    if (ret == OK){
                        ++count
                    }
                }
               console.log("b")
            }
            for(var x2 = i; x2 > -i; --x2){
                if(count < amount && Math.abs(x2) % 2 == remainder){
                    var posX = center.x + x2;
                    var posY = center.y + i;
                    var ret = spawn.room.createConstructionSite(posX, posY, STRUCTURE_EXTENSION);
                    if (ret == OK){
                        ++count
                    }
                }
               console.log("c")
            }
            for(var y2 = i; y2 > -i; --y2){
                if(count < amount && Math.abs(y2) % 2 == remainder){
                    var posX = center.x - i;
                    var posY = center.y + y2;
                    var ret = spawn.room.createConstructionSite(posX, posY, STRUCTURE_EXTENSION);
                    if (ret == OK){
                        ++count
                    }
                }
               console.log("d")
            }
        }
    },
};