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

    if (this.creep.memory.assigned_source) {
      var source = Game.getObjectById(this.creep.memory.assigned_source);
      let container;
      if (source) {
        container = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: (structure: Structure) => HelperFunctions.isContainer(structure) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
      }
      if (container && container.length > 0) {
        if (!this.creep.pos.isEqualTo(container[0])) {
          this.creep.moveTo(container[0]);
        }
        if (source) {
          if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
        }
      } else {
        if (source) {
          if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
        }
      }
    } else {
      var sources = this.creep.room.sources;
      if (this.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
}
