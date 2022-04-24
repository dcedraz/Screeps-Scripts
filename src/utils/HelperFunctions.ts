export class HelperFunctions {

public static isTower(s: Structure): s is StructureTower {
    return s.structureType === STRUCTURE_TOWER;}

public static isExtension(s: Structure): s is StructureTower {
    return s.structureType === STRUCTURE_EXTENSION;}

public static isSpawn(s: Structure): s is StructureTower {
    return s.structureType === STRUCTURE_SPAWN;}
}
