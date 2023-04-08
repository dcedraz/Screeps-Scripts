import { HelperFunctions } from "utils/HelperFunctions";
export class RoleHauler {
  constructor(public creep: Creep) {}

  giveEnergyToNerbyCreeps() {
    let creeps = this.creep.pos.findInRange(FIND_MY_CREEPS, 1, {
      filter: (creep) => creep.memory.role === "builder" || creep.memory.role === "upgrader",
    });
    if (creeps.length > 0) {
      this.creep.transfer(creeps[0], RESOURCE_ENERGY);
    }
  }

  // getEnergyFromSourceContainers() {
  //   // Get all source containers from memory
  //   let sourceContainers = this.creep.room.memory.source_containers;
  //   let targetContainers: StructureContainer[] = [];

  //   Object.keys(sourceContainers).forEach((source) => {
  //     for (const containerPos of sourceContainers[source as keyof typeof sourceContainers]) {
  //       let container = this.creep.room.lookForAt(
  //         LOOK_STRUCTURES,
  //         targetContainers[0]
  //       )[0] as StructureContainer;
  //       targetContainers.push(container);
  //     }
  //   });

  //   if (targetContainers.length > 0) {
  //     // Get the container with the most amount of energy
  //     let targetContainer = targetContainers[0];
  //     let maxEnergy = 0;
  //     for (const container of targetContainers) {
  //       if (container.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergy) {
  //         maxEnergy = container.store.getUsedCapacity(RESOURCE_ENERGY);
  //         targetContainer = container;
  //       }
  //     }

  //     if (!this.creep.pos.isNearTo(targetContainer)) {
  //       this.creep.moveTo(targetContainer, { visualizePathStyle: { stroke: "#ffffff" } });
  //     }
  //     this.creep.withdraw(targetContainer, RESOURCE_ENERGY);
  //   }
  // }

  getGreatestDroppedEnergy() {
    let target = HelperFunctions.getGreatestEnergyDrop(this.creep.room);
    if (target) {
      if (!this.creep.pos.isNearTo(target)) {
        this.creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      this.creep.pickup(target);
    }
  }
  getEnergy() {
    let source;
    let droppedEnergyAtSource;
    let source_container;

    if (this.creep.memory.assigned_source) {
      source = Game.getObjectById(this.creep.memory.assigned_source);
    }
    if (source) {
      droppedEnergyAtSource = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
      source_container = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (structure: Structure) => HelperFunctions.isContainer(structure),
      });
    }
    if (droppedEnergyAtSource && droppedEnergyAtSource.length > 0) {
      if (!this.creep.pos.isNearTo(droppedEnergyAtSource[0])) {
        this.creep.moveTo(droppedEnergyAtSource[0], {
          visualizePathStyle: { stroke: "#ffffff" },
        });
      }
      this.creep.pickup(droppedEnergyAtSource[0]);
    } else if (source_container && source_container.length > 0) {
      if (!this.creep.pos.isNearTo(source_container[0])) {
        this.creep.moveTo(source_container[0], {
          visualizePathStyle: { stroke: "#ffffff" },
        });
      }
      this.creep.withdraw(source_container[0], RESOURCE_ENERGY);
    } else {
      this.getGreatestDroppedEnergy();
    }
  }

  storeEnergy() {
    let targets = this.sortStorageTargetsByType();
    if (targets.length > 0) {
      if (!this.creep.pos.isNearTo(targets[0])) {
        this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
      this.creep.transfer(targets[0], RESOURCE_ENERGY);
    }
  }

  sortStorageTargetsByType(): Structure[] {
    let targets = HelperFunctions.getRoomStructuresArray(this.creep.room).filter(
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
      if (HelperFunctions.isTower(targets[i])) {
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
      this.giveEnergyToNerbyCreeps();
      this.storeEnergy();
    } else {
      this.getEnergy();
    }
  }
}
