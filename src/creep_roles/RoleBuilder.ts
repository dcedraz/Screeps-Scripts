import { HelperFunctions } from "utils/HelperFunctions";

export function runBuilderRole(creep: Creep): void {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
    creep.memory.working = false;
    creep.say("🔄 collect");
  }
  if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
    creep.memory.working = true;
    creep.say("⚡ build");
  }

  const repairSites = HelperFunctions.getRoomStructuresArray(creep.room).filter(
    (structure: { hits: number; hitsMax: number }) => {
      return structure.hits < structure.hitsMax;
    }
  );

  if (!creep.memory.working) {
    getEnergy(creep);
  }

  if (creep.memory.working && creep.room.cSites.length > 0) {
    runBuild(creep);
  } else if (creep.memory.working && repairSites.length > 0) {
    //if no construction sites, look for repair sites
    runRepair(creep, repairSites);
  } else if (creep.memory.working) {
    // if nothing else to do, go upgrade
    const checkController = creep.room.controller;
    if (checkController) {
      if (creep.upgradeController(checkController) == ERR_NOT_IN_RANGE) {
        creep.moveTo(checkController, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }
}

function getEnergy(creep: Creep): void {
  const storage = HelperFunctions.getRoomStructuresArray(creep.room).filter(
    (structure: Structure<StructureConstant>) => {
      return (
        (HelperFunctions.isStorage(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
        (HelperFunctions.isContainer(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
        (HelperFunctions.isExtension(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
        (HelperFunctions.isSpawn(structure) && structure.store[RESOURCE_ENERGY] > 200)
      );
    }
  );
  const dropped = HelperFunctions.getGreatestEnergyDrop(creep.room);

  if (storage.length > 0) {
    if (creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(storage[0], { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  } else if (dropped) {
    if (!creep.pos.isNearTo(dropped)) {
      creep.moveTo(dropped, { visualizePathStyle: { stroke: "#ffaa00" } });
    } else {
      creep.pickup(dropped);
    }
  }
}

function runBuild(creep: Creep): void {
  if (creep.build(creep.room.cSites[0]) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.cSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
  }
}

function runRepair(creep: Creep, repairSites: Structure[]): void {
  if (repairSites.length > 0) {
    if (creep.repair(repairSites[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(repairSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }
}
