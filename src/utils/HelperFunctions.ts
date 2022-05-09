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

  // check for hostile nearby

  public static isHostileNearby(structure: any): boolean {
    var hostile = structure.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    if (hostile.length > 0) {
      return true;
    }
    return false;
  }
}
