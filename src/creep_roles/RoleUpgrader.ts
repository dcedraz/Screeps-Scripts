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
    const sources = prioritizeStorageTargetsByType(creep);
    if (sources.length > 0) {
      if (creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }
}

function prioritizeStorageTargetsByType(creep: Creep): Structure[] {
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

  // Assign priority: Storage (1), Container (2), Extension (3), Spawn (4)
  const getPriority = (structure: Structure): number => {
    if (HelperFunctions.isStorage(structure)) return 1;
    if (HelperFunctions.isContainer(structure)) return 2;
    if (HelperFunctions.isExtension(structure)) return 3;
    if (HelperFunctions.isSpawn(structure)) return 4;
    return 5;
  };

  return targets.sort((a, b) => getPriority(a) - getPriority(b));
}
