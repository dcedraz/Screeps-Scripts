import { HelperFunctions } from "utils/HelperFunctions";
export class RoleHarvester {
  constructor(public creep: Creep) {}

  repairNerbyContainer() {
    let containers = this.creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure) =>
        structure.structureType == STRUCTURE_CONTAINER && structure.hits < structure.hitsMax,
    });
    if (containers.length > 0) {
      this.creep.repair(containers[0]);
    }
  }

  moveToNerbyContainer() {
    let containers = this.creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure) =>
        structure.structureType == STRUCTURE_CONTAINER
    });
    if (containers.length > 0) {
      this.creep.moveTo(containers[0]);
    }
  }

  sortStorageTargetsByType(): Structure[] {
    let targets = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure: Structure) => {
        return (
          (HelperFunctions.isExtension(structure) ||
            HelperFunctions.isContainer(structure) ||
            HelperFunctions.isSpawn(structure)) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });

    var sortedTargets: Structure[] = [];
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isSpawn(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isExtension(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isContainer(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    return sortedTargets;
  }

  findClosestSpawn(): StructureSpawn {
    let spawn = this.creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    if (spawn) {
      return spawn;
    }
    return this.creep.room.find(FIND_MY_SPAWNS)[0];
  }

  createPathToSource(path: PathStep[]) {
    if (path.length > 0) {
      for (let i = 0; i < path.length - 2; i++) {
        this.creep.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
      }
    }
    this.creep.room.createConstructionSite(
      path[path.length - 2].x,
      path[path.length - 2].y,
      STRUCTURE_CONTAINER
    );
  }

  giveEnergyToNerbyCreeps() {
    let creeps = this.creep.pos.findInRange(FIND_MY_CREEPS, 1, {
      filter: (creep) => creep.memory.role != "harvester",
    });
    if (creeps.length > 0) {
      this.creep.transfer(creeps[0], RESOURCE_ENERGY);
    }
  }

  runInitial() {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      this.repairNerbyContainer();
      this.giveEnergyToNerbyCreeps();
    }

    if (this.creep.store.getFreeCapacity() > 0) {
      if (this.creep.memory.assigned_source) {
        var source = Game.getObjectById(this.creep.memory.assigned_source);
        if (source) {
          if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
        }
      } else {
        var sources = this.creep.room.find(FIND_SOURCES);
        if (this.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    } else {
      var targets = this.sortStorageTargetsByType();
      if (targets.length > 0) {
        if (this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    }
  }
}
