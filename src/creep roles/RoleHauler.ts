import { HelperFunctions } from "utils/HelperFunctions";
export class RoleHauler {
  constructor(public creep: Creep) {}

  getEnergyFromStorage() {
    this.creep.say("🔄 Storage");
    let storage = this.creep.room.storage;
    if (storage) {
      if (!this.creep.pos.isNearTo(storage)) {
        this.creep.moveTo(storage);
      }
      this.creep.withdraw(storage, RESOURCE_ENERGY);
    }
  }

  loadTowers() {
    this.creep.say("Towers");
    let towers = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          HelperFunctions.isTower(structure) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      },
    });
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      if (towers.length > 0) {
        if (!this.creep.pos.isNearTo(towers[0])) {
          this.creep.moveTo(towers[0]);
        }
        this.creep.transfer(towers[0], RESOURCE_ENERGY);
      }
    } else {
      this.getEnergyFromStorage();
    }
  }

  getEnergyFromSourceContainers() {
    this.creep.say("🔄 Source Containers");
    // Get all source containers from memory
    let sourceContainers = this.creep.room.memory.source_containers;
    let targetContainers: StructureContainer[] = [];

    Object.keys(sourceContainers).forEach((source) => {
      for (const containerPos of sourceContainers[source as keyof typeof sourceContainers]) {
        let container = this.creep.room.lookForAt(
          LOOK_STRUCTURES,
          targetContainers[0]
        )[0] as StructureContainer;
        targetContainers.push(container);
      }
    });

    if (targetContainers.length > 0) {
      // Get the container with the most amount of energy
      let targetContainer = targetContainers[0];
      let maxEnergy = 0;
      for (const container of targetContainers) {
        if (container.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergy) {
          maxEnergy = container.store.getUsedCapacity(RESOURCE_ENERGY);
          targetContainer = container;
        }
      }

      if (!this.creep.pos.isNearTo(targetContainer)) {
        this.creep.moveTo(targetContainer);
      }
      this.creep.withdraw(targetContainer, RESOURCE_ENERGY);
    }
  }

  getDroppedEnergy() {
    this.creep.say("🔄 Dropped");
    let dropped = this.creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: (resource) => resource.resourceType == RESOURCE_ENERGY,
    });
    if (dropped.length > 0) {
      if (!this.creep.pos.isNearTo(dropped[0])) {
        this.creep.moveTo(dropped[0]);
      }
      this.creep.pickup(dropped[0]);
    }
  }

  storeEnergy() {
    this.creep.say("Storaging energy");
    let targets = this.sortStorageTargetsByType();
    if (targets.length > 0) {
      if (!this.creep.pos.isNearTo(targets[0])) {
        this.creep.moveTo(targets[0]);
      }
      this.creep.transfer(targets[0], RESOURCE_ENERGY);
    }
  }

  sortStorageTargetsByType(): Structure[] {
    let targets = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure: Structure) => {
        return (
          (HelperFunctions.isExtension(structure) ||
            HelperFunctions.isStorage(structure) ||
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
      if (HelperFunctions.isStorage(targets[i])) {
        sortedTargets.push(targets[i]);
      }
    }
    return sortedTargets;
  }

  run() {
    if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      this.loadTowers();
      this.storeEnergy();
    } else {
      this.getDroppedEnergy();
      this.getEnergyFromSourceContainers;
    }
  }
}
