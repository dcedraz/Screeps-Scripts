import { HelperFunctions } from "utils/HelperFunctions";
export class RoleHarvester {
  constructor(public creep: Creep) {}

  runInitial() {
    if (this.creep.store.getFreeCapacity() > 0) {
      if (this.creep.memory.assigned_source) {
        var source = Game.getObjectById(this.creep.memory.assigned_source);
        if (source) {
          if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
        }
      } else {
        var sources = this.creep.room.find(FIND_SOURCES);
        if (this.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
        }
      }
    } else {
      var targets = this.creep.room.find(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
          return (
            (HelperFunctions.isExtension(structure) ||
              HelperFunctions.isContainer(structure) ||
              HelperFunctions.isSpawn(structure)) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });
      if (targets.length > 0) {
        if (this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    }
  }
}
