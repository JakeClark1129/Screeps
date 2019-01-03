/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepDesigner');
 * mod.thing == 'a thing'; // true
 */
var nameGenerator = require('nameGenerator');


    //Creep roles
var ROLE_UNASSIGNED = 0
var ROLE_MINER = 1
var ROLE_TRANSPORTER = 2
var ROLE_UPGRADER = 3
var ROLE_WORKER = 4


/* Screep recipes:
 * MOVE_SPEED is the requires ticks/movement ratio (Off roads). 0 if only 1 movement part is required
 * BASE is the smallest possible variation of this creep for it to be functional. (MOVE parts not included)
 * BODY_PART_EXTENSIONS is the additional parts that can be added to make a creep more effecient.
 * MAX_EXTENSIONS is the maximum amount of extensions you can put on a creep.
*/

//MINER
var MINER_MOVE_SPEED = 0;
var MINER_BODY_BASE = [WORK];
var MINER_BODY_EXTENSIONS = [WORK];
var MINER_MAX_EXTENSIONS = 4

//TRANSPORTER
var TRANSPORTER_MOVE_SPEED = 1;
var TRANSPORTER_BODY_BASE = [CARRY];
var TRANSPORTER_BODY_EXTENSIONS = [CARRY];
var TRANSPORTER_MAX_EXTENSIONS = 14

//UPGRADER
var UPGRADER_MOVE_SPEED = 6;
var UPGRADER_BODY_BASE = [CARRY, WORK];
var UPGRADER_BODY_EXTENSIONS = [WORK];
var UPGRADER_MAX_EXTENSIONS = 10

//WORKER
var WORKER_MOVE_SPEED = 1;
var WORKER_BODY_BASE = [CARRY, CARRY, WORK];
var WORKER_BODY_EXTENSIONS = [WORK, CARRY, CARRY];
var WORKER_MAX_EXTENSIONS = 5

module.exports = {
    
    //Creep roles
    ROLE_UNASSIGNED,
    ROLE_MINER,
    ROLE_TRANSPORTER,
    ROLE_UPGRADER,
    ROLE_WORKER,
    buildCreep: function(creepRole, budget, customMemory, debug)
    {
        if (budget === undefined)
        {
            console.log("Trying to build a creep without a budget specified")
            return null
        }
        var result = null
        switch(creepRole)
        {
            case ROLE_MINER:
                result = _buildCreep(MINER_MOVE_SPEED, MINER_BODY_BASE, MINER_BODY_EXTENSIONS, MINER_MAX_EXTENSIONS, "miner", budget, customMemory, debug)
                break;
            case ROLE_TRANSPORTER:
                result = _buildCreep(TRANSPORTER_MOVE_SPEED, TRANSPORTER_BODY_BASE, TRANSPORTER_BODY_EXTENSIONS, TRANSPORTER_MAX_EXTENSIONS, "transporter", budget, customMemory, debug)
                break;
            case ROLE_UPGRADER:
                result = _buildCreep(UPGRADER_MOVE_SPEED, UPGRADER_BODY_BASE, UPGRADER_BODY_EXTENSIONS, UPGRADER_MAX_EXTENSIONS, "upgrader", budget, customMemory, debug)
                break;
            case ROLE_WORKER:
                result = _buildCreep(WORKER_MOVE_SPEED, WORKER_BODY_BASE, WORKER_BODY_EXTENSIONS, WORKER_MAX_EXTENSIONS, "worker", budget, customMemory, debug)
                break;
            default:
                console.log("ERROR: Unrecognized creepRole: " + creepRole)
                result = null
        }
        return result
    }
};

//Function to build a creep, given a recipe
var _buildCreep = function(moveSpeed, bodyBase, bodyExtension, maxExtensions, role, budget, customMemory, debug)
{
    if (moveSpeed === 0)
    {
        //Assign a rediculously high value so it will always be 1 move part.
        moveSpeed = 9999;    
    }
    
    if (debug)
    {
        console.log("base: " + bodyBase);
        console.log("extension: " + bodyExtension);
        console.log("maxExtensions: " + maxExtensions);
        console.log("role: " + role);
        console.log("budget: " + budget);
    }
    
    var baseCost = calculateBodyCost(bodyBase)
    var extensionCost = calculateBodyCost(bodyExtension);
    
    var baseWeight = calculateBodyWeight(bodyBase);
    var extensionWeight = calculateBodyWeight(bodyExtension);
    
    //Initialize body with smallest option
    var body = bodyBase;
    var bodyWeight = baseWeight;
    var bodyCost = baseCost;
    var movementCost = Math.ceil(bodyWeight / (2 * moveSpeed)) * BODYPART_COST[MOVE]
    
    var nextStepBodyWeight = baseWeight + extensionWeight;
    var nextStepBodyCost = baseCost + extensionCost
    var nextStepMovementCost = Math.ceil(nextStepBodyWeight / (2 * moveSpeed)) * BODYPART_COST[MOVE]

    if (debug)
    {
        console.log("baseCost: " + baseCost);
        console.log("extensionCost: " + extensionCost);
        console.log("baseWeight: " + baseWeight);
        console.log("extensionWeight: " + extensionWeight);
        
        console.log("body: " + body);
        console.log("bodyWeight: " + bodyWeight);
        console.log("bodyCost: " + bodyCost);
        console.log("movementCost: " + movementCost);
        
        console.log("nextStepCost < budget -- " + (nextStepBodyCost + nextStepMovementCost) + " < " + budget);
    }
    
    var iters = 0;
    while(nextStepBodyCost + nextStepMovementCost <= budget && iters < maxExtensions)
    {
        body = body.concat(bodyExtension)
        bodyWeight = nextStepBodyWeight
        bodyCost = nextStepBodyCost
        movementCost = nextStepMovementCost
        
        nextStepBodyWeight = bodyWeight + extensionWeight;
        nextStepBodyCost = bodyCost + extensionCost;
        nextStepMovementCost = Math.ceil(nextStepBodyWeight / (2 * moveSpeed)) * BODYPART_COST[MOVE]
        ++iters
        
        if(debug)
        {
            console.log("iters: " + iters)
            console.log("body: " + body)
            console.log("bodyCost: " + bodyCost)
            console.log("movementCost: " + movementCost)
            
            
            console.log("nextStepBodyWeight: " + nextStepBodyWeight)
            console.log("nextStepBodyCost: " + nextStepBodyCost)
            console.log("nextStepMovementCost: " + nextStepMovementCost)
            
            console.log("nextStepCost < budget -- " + (nextStepBodyCost + nextStepMovementCost) + " < " + budget);
        }
    }
    var finalBody = [];
    var movePiecesRequired = Math.ceil(bodyWeight/  (2 * moveSpeed))
    if(debug)
    {
        console.log("movePiecesRequired: " + movePiecesRequired)
    }
    for(var i = 0; i < Math.ceil(movePiecesRequired); ++i)
    {
        finalBody.push(MOVE)
    }
    finalBody = finalBody.concat(body)
    
    if (debug)
    {
        console.log("FinalBody: " + finalBody)
        
    }
    var name = nameGenerator.getName();
    if (!Game.spawns['Spawn1'].memory.reserved)
    {
        var memory = customMemory;
        if (!memory)
        {
            memory = {}
        }
        memory['role'] = role
        memory['state'] = "initializing"
        var result = Game.spawns['Spawn1'].spawnCreep(finalBody, name,  {memory:memory});
        if (result === OK)
        {
            Game.spawns['Spawn1'].memory.reserved = true
            if (debug)
            {
                console.log("Successfully spawned a: " + role)
            }
            return name
        }
        else 
        {
            //console.log("Unable to spawn a: " + role + " because: " + result)
            return null
        }
    }
}

var calculateBodyCost = function(body)
{
    var cost = 0;
    for (var i = 0; i < body.length; ++i )
    {
        cost += BODYPART_COST[body[i]];
    }    
    return cost;
}


var calculateBodyWeight = function(body)
{
    var weight = body.length * 2; //Calculation based off of off road speed
    for (var i = 0; i < body.length; ++i )
    {
        if (body[i] === CARRY)
        {
            //Carry parts weigh half beause half the time they weigh nothing
            weight -= 1;
        }
    }    
    return weight;
}


    


