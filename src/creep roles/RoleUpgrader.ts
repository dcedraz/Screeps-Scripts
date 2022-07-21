import { HelperFunctions } from "utils/HelperFunctions";
export class RoleUpgrader {
  constructor(public creep: Creep) {}

  run() {
    if (this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] == 0) {
      this.creep.memory.working = false;
      this.creep.say("🔄 collect");
    }
    if (!this.creep.memory.working && this.creep.store.getFreeCapacity() == 0) {
      this.creep.memory.working = true;
      this.creep.say("⚡ upgrade");
    }

    if (this.creep.memory.working) {
      const checkController = this.creep.room.controller;
      if (checkController) {
        if (this.creep.upgradeController(checkController) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(checkController, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    } else {
      var sources = this.creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (HelperFunctions.isStorage(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
            (HelperFunctions.isContainer(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
            (HelperFunctions.isExtension(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
            (HelperFunctions.isSpawn(structure) && structure.store[RESOURCE_ENERGY] > 200)
          );
        },
      });
      if (sources.length > 0) {
        if (this.creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    }
  }
}
