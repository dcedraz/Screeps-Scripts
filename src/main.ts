import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "role.harvester";
import { roleUpgrader } from "role.upgrader";
import { roleBuilder } from "role.builder";
import { RoomInstance } from "utils/RoomInstance";
import { HelperFunctions } from "utils/HelperFunctions";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }

}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  // Spawn new harvester if needed
  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  if(harvesters.length < 2) {
      var newName = 'Harvester' + Game.time;
      console.log('Spawning new harvester: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
          {memory: {role: 'harvester', working: false, room: Game.spawns['Spawn1'].room.name}});
  }

// Spawn new upgrader if needed
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  if(upgraders.length < 1) {
      var newName = 'Upgrader' + Game.time;
      console.log('Spawning new upgrader: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
          {memory: {role: 'upgrader', working: false, room: Game.spawns['Spawn1'].room.name}});
  }

  // Spawn new builder if needed
  var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  if(builders.length < 1) {
      var newName = 'Builder' + Game.time;
      console.log('Spawning new builder: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
          {memory: {role: 'builder', working: false, room: Game.spawns['Spawn1'].room.name}});
  }

  // Spawn visuals
  if(Game.spawns['Spawn1'].spawning) {
      var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
      Game.spawns['Spawn1'].room.visual.text(
          '🛠️' + spawningCreep.memory.role,
          Game.spawns['Spawn1'].pos.x + 1,
          Game.spawns['Spawn1'].pos.y,
          {align: 'left', opacity: 0.8});
  }

  // Towers logic
  const towers = _.filter(Game.structures, (s: Structure) => s.structureType === STRUCTURE_TOWER) as StructureTower[];
  for (const tower of towers ) {
    const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure: Structure) => structure.hits < structure.hitsMax
    });
    if (closestDamagedStructure) {

      tower.repair(closestDamagedStructure);
    }

    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    }
  }

  // Run creep logic
  for (const room in Game.rooms) {
    const roomInstance = new RoomInstance(Game.rooms[room]);
    if (roomInstance.roomController) {

      for (const creepName in Game.creeps) {
        const creep = Game.creeps[creepName];
        if (creep.memory.room === room) {
          if (creep.memory.role === "harvester") {
            roleHarvester.run(creep);
          } else if (creep.memory.role === "upgrader") {
            roleUpgrader.run(creep);
          } else if (creep.memory.role === "builder") {
            roleBuilder.run(creep);
          }
        }
      }
    }
  }

});
