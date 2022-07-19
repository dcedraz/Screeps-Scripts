import { HelperFunctions } from "utils/HelperFunctions";
export class RoleBuilder {
  constructor(
    public creep: Creep,
    public myConstructionSites: ConstructionSite[] = creep.room.find(FIND_CONSTRUCTION_SITES)
  ) {}

  run() {
    if (this.creep.memory.working && this.creep.store[RESOURCE_ENERGY] == 0) {
      this.creep.memory.working = false;
      this.creep.say("🔄 collect");
    }
    if (!this.creep.memory.working && this.creep.store.getFreeCapacity() == 0) {
      this.creep.memory.working = true;
      this.creep.say("⚡ build");
    }

    const repairSites = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.hits < structure.hitsMax;
      },
    });

    if (!this.creep.memory.working) {
      this.getEnergy();
    }

    if (this.creep.memory.working && this.myConstructionSites.length > 0) {
      this.runBuild();
    } else if (this.creep.memory.working && repairSites.length > 0) {
      //if no construction sites, look for repair sites
      this.runRepair(repairSites);
    } else if (this.creep.memory.working) {
      // if nothing else to do, go upgrade
      const checkController = this.creep.room.controller;
      if (checkController) {
        if (this.creep.upgradeController(checkController) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(checkController, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    }
  }

  getEnergyFromHarvester() {
    const harvesters = this.creep.room.find(FIND_MY_CREEPS, {
      filter: (creep) => creep.memory.role == "harvester",
    });
    if (harvesters.length > 0) {
      if (!this.creep.pos.isNearTo(harvesters[0])) {
        this.creep.moveTo(harvesters[0]);
      }
    }
  }
  getEnergy() {
    var storage = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          (HelperFunctions.isContainer(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
          (HelperFunctions.isExtension(structure) && structure.store[RESOURCE_ENERGY] > 0) ||
          (HelperFunctions.isSpawn(structure) && structure.store[RESOURCE_ENERGY] > 200)
        );
      },
    });
    var sources = this.creep.room.find(FIND_SOURCES, {
      filter: (source) => !HelperFunctions.isCreepNearby(source),
    });

    if (storage.length > 0) {
      if (this.creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(storage[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else if (sources.length > 0) {
      if (this.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      this.getEnergyFromHarvester();
    }
  }

  runBuild() {
    if (this.creep.build(this.myConstructionSites[0]) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.myConstructionSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }

  runRepair(repairSites: Structure[]) {
    if (repairSites.length > 0) {
      if (this.creep.repair(repairSites[0]) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(repairSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }
}
