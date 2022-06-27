import { ErrorMapper } from "utils/ErrorMapper";
import { RoomInstance } from "RoomInstance";
import { constants } from "buffer";

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
    assigned_source?: Id<Source>;
    pathToSource?: PathStep[];
  }

  interface RoomMemory {
    sourcesMapped: Id<Source>[];
  }

  interface SpawnWorkOrder {
    name: string;
    body: BodyPartConstant[];
    memory: CreepMemory;
    priority: number;
    assignedSpawn?: StructureSpawn;
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
  if (Game.time % 100 === 0) {
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }
  }

  // Print out stats every 100 ticks
  if (Game.time % 10 === 0) {
    for (const room in Game.rooms) {
      if (Game.rooms[room].controller) {
        console.log(`Tick: ${Game.time}`);
        console.log(`CPU used: ${Game.cpu.getUsed().toFixed(3)}`);
        console.log(`CPU limit: ${Game.cpu.limit}`);
        console.log(`CPU bucket: ${Game.cpu.bucket}`);
        console.log(
          `Energy: ${Game.rooms[room].energyAvailable}/${Game.rooms[room].energyCapacityAvailable}`
        );
        console.log(
          `GCL: ${Game.gcl.level}, progress: ${Game.gcl.progress}, progressTotal: ${Game.gcl.progressTotal}`
        );
      }
    }
  }

  // Towers logic
  const towers = _.filter(
    Game.structures,
    (s: Structure) => s.structureType === STRUCTURE_TOWER
  ) as StructureTower[];
  for (const tower of towers) {
    const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure: Structure) => structure.hits < structure.hitsMax,
    });
    if (closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }

    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    }
  }

  // Run room logic
  for (const room in Game.rooms) {
    const roomInstance = new RoomInstance(Game.rooms[room]);
    if (roomInstance.roomController) {
      roomInstance.run();
    }
  }
});
