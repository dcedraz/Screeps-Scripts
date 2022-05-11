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

  public static getExtensionCount(level: number): number {
    switch (level) {
      case 2:
        return 5;
      case 3:
        return 10;
      case 4:
        return 20;
      case 5:
        return 30;
      case 6:
        return 40;
      case 7:
        return 50;
      case 8:
        return 60;
      default:
        return 0;
    }
  }

  // check for hostile nearby

  public static isHostileNearby(structure: any): boolean {
    var hostile = structure.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    if (hostile.length > 0) {
      return true;
    }
    return false;
  }
}
