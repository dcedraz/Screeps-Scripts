import { HelperFunctions } from "utils/HelperFunctions";

export function runHaulerRole(creep: Creep): void {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    giveEnergyToNearbyCreeps(creep);
    storeEnergy(creep);
  } else {
    getEnergy(creep);
  }
}

function giveEnergyToNearbyCreeps(creep: Creep): void {
  const creeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
    filter: (c) => c.memory.role === "builder" || c.memory.role === "upgrader",
  });
  if (creeps.length > 0) {
    creep.transfer(creeps[0], RESOURCE_ENERGY);
  }
}

function getEnergy(creep: Creep): void {
  let source;
  let droppedEnergyAtSource;
  let source_container;

  if (creep.memory.assigned_source) {
    source = Game.getObjectById(creep.memory.assigned_source);
  }
  if (source) {
    droppedEnergyAtSource = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
    source_container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure: Structure) => HelperFunctions.isContainer(structure),
    });
  }
  if (droppedEnergyAtSource && droppedEnergyAtSource.length > 0) {
    if (!creep.pos.isNearTo(droppedEnergyAtSource[0])) {
      creep.moveTo(droppedEnergyAtSource[0], {
        visualizePathStyle: { stroke: "#ffffff" },
      });
    }
    creep.pickup(droppedEnergyAtSource[0]);
  } else if (source_container && source_container.length > 0) {
    if (!creep.pos.isNearTo(source_container[0])) {
      creep.moveTo(source_container[0], {
        visualizePathStyle: { stroke: "#ffffff" },
      });
    }
    creep.withdraw(source_container[0], RESOURCE_ENERGY);
  } else {
    getGreatestDroppedEnergy(creep);
  }
}

function getGreatestDroppedEnergy(creep: Creep): void {
  const target = HelperFunctions.getGreatestEnergyDrop(creep.room);
  if (target) {
    if (!creep.pos.isNearTo(target)) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
    creep.pickup(target);
  }
}

function storeEnergy(creep: Creep): void {
  const targets = prioritizeStorageTargetsByType(creep);
  if (targets.length > 0) {
    if (!creep.pos.isNearTo(targets[0])) {
      creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
    creep.transfer(targets[0], RESOURCE_ENERGY);
  }
}

function prioritizeStorageTargetsByType(creep: Creep): Structure[] {
  const targets = HelperFunctions.getRoomStructuresArray(creep.room).filter(
    (structure: Structure) => {
      return (
        (HelperFunctions.isExtension(structure) ||
          HelperFunctions.isStorage(structure) ||
          HelperFunctions.isTower(structure) ||
          HelperFunctions.isSpawn(structure)) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      );
    }
  );

  // Assign priority: Spawn (1), Extension (2), Tower (3), Storage (4)
  const getPriority = (structure: Structure): number => {
    if (HelperFunctions.isSpawn(structure)) return 1;
    if (HelperFunctions.isExtension(structure)) return 2;
    if (HelperFunctions.isTower(structure)) return 3;
    if (HelperFunctions.isStorage(structure)) return 4;
    return 5;
  }

  return targets.sort((a, b) => getPriority(a) - getPriority(b));
}
