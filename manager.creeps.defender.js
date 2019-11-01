/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('transportManager');
 * mod.thing == 'a thing'; // true
 */

var utils = require("utils")

module.exports = {
    run : function()
    {
        //TODO: Get list of structures requiring energy from transport manager
    },
    getTarget : function(creep)
    {
        //TODO: This should return the next source from the list, but right now we only have one source.
		var enemyCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (enemyCreep)
        {
            return enemyCreep[0]
        }
        return null;
    },
};