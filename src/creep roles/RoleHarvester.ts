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

    // if (this.creep.store.getFreeCapacity() > 0) {
    if (this.creep.memory.assigned_source) {
      var source = Game.getObjectById(this.creep.memory.assigned_source);
      var container = this.creep.memory.container_pos;
      if (source) {
        if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
          if (container) {
            this.creep.moveTo(container, { visualizePathStyle: { stroke: "#ffaa00" } });
          } else {
            this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
        }
      }
    } else {
      var sources = this.creep.room.find(FIND_SOURCES);
      if (this.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
    // } else {
    //   var targets = this.sortStorageTargetsByType();
    //   if (targets.length > 0) {
    //     if (this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    //       this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
    //     }
    //   }
    // }
  }
}
