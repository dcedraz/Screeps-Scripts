export class HelperFunctions {
  public static isTower(s: Structure): s is StructureTower {
    return s.structureType === STRUCTURE_TOWER;
  }
  public static isContainer(s: Structure): s is StructureContainer {
    return s.structureType === STRUCTURE_CONTAINER;
  }

  public static isExtension(s: Structure): s is StructureExtension {
    return s.structureType === STRUCTURE_EXTENSION;
  }

  public static isSpawn(s: Structure): s is StructureSpawn {
    return s.structureType === STRUCTURE_SPAWN;
  }

  public static isController(s: Structure): s is StructureController {
    return s.structureType === STRUCTURE_CONTROLLER;
  }

  public static printObjectById(id: any) {
    console.log(JSON.stringify(Game.getObjectById(id), undefined, 4));
  }

  public static findCarryPartsRequired = function (distance: number, income: number) {
    return (distance * 2 * income) / CARRY_CAPACITY;
  };

  /**
   * Uses a provided ID to find an object associated with it
   */
  public static findObjectWithID<T extends Id<any>>(ID: T): fromId<T> | undefined {
    return Game.getObjectById(ID) || undefined;
  }

  // check for hostile nearby

  public static isHostileNearby(structure: any): boolean {
    var hostile = structure.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    if (hostile.length > 0) {
      return true;
    }
    return false;
  }

  // check for harvester nearby
  public static isCreepNearby(structure: any): boolean {
    var creep = structure.pos.findInRange(FIND_MY_CREEPS, 1);
    if (creep.length > 0) {
      return true;
    }
    return false;
  }

  public static memoizeCostMatrix = (fn: any, r: Room) => {
    if (!r.memory.roomCostMatrix) {
      r.memory.roomCostMatrix = {};
    }
    return (...args: any[]) => {
      let n = args[0];
      if (n in r.memory.roomCostMatrix) {
        //console.log("Fetching CostMatrix from memory");
        return r.memory.roomCostMatrix[n];
      } else {
        //console.log("Calculating CostMatrix for room: ", n);
        let result = fn(n);
        r.memory.roomCostMatrix[n] = result;
        return result;
      }
    };
  };

  public static memoizeRoomPositions = (fn: any, r: Room) => {
    if (!r.memory.roomPositions) {
      r.memory.roomPositions = {};
    }
    return (...args: any[]) => {
      let n = args[0];
      if (n in r.memory.roomPositions) {
        // console.log("Fetching RoomPositions from memory");
        return r.memory.roomPositions[n];
      } else {
        // console.log("Calculating RoomPositions for room: ", n);
        let result = fn(n);
        r.memory.roomPositions[n] = result;
        return result;
      }
    };
  };

  public static emptyBaseStructures(): BaseStructures {
    return {
      spawn: [],
      storage: [],
      link: [],
      container: [],
      tower: [],
      road: [],
      extension: [],
      wall: [],
      rampart: [],
    };
  }
}
