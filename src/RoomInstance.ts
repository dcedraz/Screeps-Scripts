import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { HelperFunctions } from "utils/HelperFunctions";

// TODO - Create a way to control harvesters assigned to a source

export class RoomInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomEnergyAvailable: number;
  roomEnergyCapacityAvailable: number;
  roomSpawner: SpawnerInstance;
  roomSources: Source[];
  roomMyConstructionSites: ConstructionSite[];
  roomCreeps: CreepsInstance;

  // constructor
  constructor(room: Room) {
    this.room = room;
    this.roomController = room.controller && room.controller.my ? room.controller : undefined;
    this.roomEnergyAvailable = room.energyAvailable;
    this.roomEnergyCapacityAvailable = room.energyCapacityAvailable;
    this.roomSpawner = new SpawnerInstance(room);
    this.roomSources = room.find(FIND_SOURCES, {
      filter: (source) => !HelperFunctions.isHostileNearby(source),
    });
    this.roomCreeps = new CreepsInstance(room);
    this.roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    // roomTerminal = room.terminal;
    // roomStructures = room.find(FIND_STRUCTURES);
    // roomHostiles = room.find(FIND_HOSTILE_CREEPS);
    // roomMyStructures = room.find(FIND_MY_STRUCTURES);
  }

  runSafeMode() {
    if (
      this.roomController &&
      this.roomController.level > 1 &&
      this.roomController.safeMode &&
      this.roomController.safeMode < 1000 &&
      this.roomController.safeModeCooldown === undefined
    ) {
      this.roomController.activateSafeMode();
    }
  }
  getExtensionCount(level: number): number {
    switch (level) {
      case 2:
        return 5;
      case 3:
        return 10;
      case 4:
        return 20;
      case 5:
        return 30;
      case 6:
        return 40;
      case 7:
        return 50;
      case 8:
        return 60;
      default:
        return 0;
    }
  }

  createExtensions() {
    if (this.roomController && this.roomController.level > 1) {
      // let extensionCount = HelperFunctions.getExtensionCount(this.roomController.level);
      let extensionCount = this.getExtensionCount(this.roomController.level);
      let extensionPositions = this.room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });
      if (extensionPositions.length < extensionCount) {
        for (let i = extensionPositions.length; i < extensionCount; i++) {
          this.room.createConstructionSite(extensionPositions[i].pos, STRUCTURE_EXTENSION);
        }
      }
    }
  }

  // createContainers() {
  //   if (this.roomController && this.roomController.level > 1) {
  //     this.roomSources.forEach((source) => {
  //       if (source.energy > 0) {
  //         let constructionSite = this.room.createConstructionSite(
  //           source.pos.x,
  //           source.pos.y - 1,
  //           STRUCTURE_CONTAINER
  //         );
  //         if (constructionSite === ERR_INVALID_TARGET) {
  //           constructionSite = this.room.createConstructionSite(
  //             source.pos.x - 1,
  //             source.pos.y - 1,
  //             STRUCTURE_CONTAINER
  //           )
  //         }
  //       }
  //     })
  //   }
  // }

  // find available sources
  findAvailableSources(): Source[] {
    return this.roomSources.filter(
      (source) =>
        this.roomCreeps.harvesters.filter((creep) => creep.memory.assigned_source === source.id)
          .length === 0
    );
  }

  run() {
    // activate safe mode if needed
    this.runSafeMode();

    // Spawn harvesters
    if (this.roomController && this.roomController.level <= 3) {
      if (this.roomCreeps.harvesters.length < this.roomSources.length) {
        this.roomSpawner.spawnQueueAdd(
          this.roomCreeps.newInitialCreep(
            "harvester",
            this.roomCreeps.harvesters.length < 2 ? 10 : 21,
            this.findAvailableSources()[0]
          )
        );
      }

      // Spawn upgraders
      if (this.roomCreeps.upgraders.length < this.roomController.level) {
        this.roomSpawner.spawnQueueAdd(this.roomCreeps.newInitialCreep("upgrader", 20));
      }

      // Spawn builders
      if (this.roomCreeps.builders.length < this.roomController.level * 2) {
        this.roomSpawner.spawnQueueAdd(this.roomCreeps.newInitialCreep("builder", 30));
      }
    }

    this.roomSpawner.run();
    this.roomCreeps.run();
    // this.roomTerminal.run();
    // this.roomStructures.run();
    // this.roomHostiles.run();
    // this.roomMyStructures.run();
    // this.roomMyConstructionSites.run();
  }
}
