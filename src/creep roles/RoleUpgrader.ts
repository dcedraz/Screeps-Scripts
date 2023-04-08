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
      var sources = this.sortStorageTargetsByType();
      if (sources.length > 0) {
        if (this.creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    }
  }

  sortStorageTargetsByType(): Structure[] {
    let targets = HelperFunctions.getRoomStructuresArray(this.creep.room).filter(
      (structure: Structure) => {
        return (
          (HelperFunctions.isExtension(structure) ||
            HelperFunctions.isStorage(structure) ||
            HelperFunctions.isContainer(structure) ||
            HelperFunctions.isSpawn(structure)) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        );
      }
    );

    var sortedTargets: Structure[] = [];
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isStorage(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isContainer(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isExtension(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    for (let i = 0; i < targets.length; i++) {
      if (HelperFunctions.isSpawn(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    return sortedTargets;
  }
}
