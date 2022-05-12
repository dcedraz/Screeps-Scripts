export class RoleBuilder {
  constructor(public creep: Creep) {}

  run() {
    if (this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] == 0) {
      this.creep.memory.working = false;
      this.creep.say("🔄 collect");
    }
    if (!this.creep.memory.working && this.creep.store.getFreeCapacity() == 0) {
      this.creep.memory.working = true;
      this.creep.say("⚡ build");
    }
    if (this.creep.memory.working) {
      //look for construction sites
      const constructionSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
      if (constructionSites.length > 0) {
        if (this.creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else {
        //if no construction sites, look for repair sites
        const repairSites = this.creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.hits < structure.hitsMax;
          },
        });
        if (repairSites.length > 0) {
          if (this.creep.repair(repairSites[0]) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(repairSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
          }
        }
      }
    } else {
      var sources = this.creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_STORAGE ||
            (structure.structureType == STRUCTURE_SPAWN && structure.store[RESOURCE_ENERGY] > 200)
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
