import { HelperFunctions } from "utils/HelperFunctions";

export function runHarvesterRole(creep: Creep): void {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    repairNearbyContainer(creep);
    giveEnergyToNearbyCreeps(creep);
  }

  if (creep.memory.assigned_source) {
    const source = Game.getObjectById(creep.memory.assigned_source);
    let container;
    if (source) {
      container = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (structure: Structure) => 
          HelperFunctions.isContainer(structure) && 
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      });
    }
    if (container && container.length > 0) {
      if (!creep.pos.isEqualTo(container[0])) {
        creep.moveTo(container[0]);
      }
      if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    } else {
      if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    }
  } else {
    const sources = creep.room.sources;
    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}

function repairNearbyContainer(creep: Creep): void {
  const containers = creep.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure) =>
      structure.structureType == STRUCTURE_CONTAINER && 
      structure.hits < structure.hitsMax,
  });
  if (containers.length > 0) {
    creep.repair(containers[0]);
  }
}

function giveEnergyToNearbyCreeps(creep: Creep): void {
  const creeps = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
    filter: (c) => c.memory.role != "harvester",
  });
  if (creeps.length > 0) {
    creep.transfer(creeps[0], RESOURCE_ENERGY);
  }
}
