/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('memoryManager');
 * mod.thing == 'a thing'; // true
 */


var addRoomMemory = function(room, key, value)
{
    if (!Memory.rooms[room.name])
    {
        Memory.rooms[room.name] = {}
    }
    Memory.rooms[room.name][key] = value
}


var getRoomMemory = function(room, key)
{
    if (!Memory.rooms[room.name])
    {
        Memory.rooms[room.name] = {}
        return 
    }
    Memory.rooms[room.name][key] = value
}

module.exports = {
    addRoomMemory : addRoomMemory,
};