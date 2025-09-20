import { HelperFunctions } from "utils/HelperFunctions";

export function runUpgraderRole(creep: Creep): void {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
    creep.memory.working = false;
    creep.say("🔄 collect");
  }
  if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
    creep.memory.working = true;
    creep.say("⚡ upgrade");
  }

  if (creep.memory.working) {
    const checkController = creep.room.controller;
    if (checkController) {
      if (creep.upgradeController(checkController) == ERR_NOT_IN_RANGE) {
        creep.moveTo(checkController, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  } else {
    const sources = sortStorageTargetsByType(creep);
    if (sources.length > 0) {
      if (creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
}

function sortStorageTargetsByType(creep: Creep): Structure[] {
  const targets = HelperFunctions.getRoomStructuresArray(creep.room).filter(
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

  const sortedTargets: Structure[] = [];
  // Priority order: Storage -> Container -> Extension -> Spawn
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
