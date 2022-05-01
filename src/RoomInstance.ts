import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { roleHarvester } from "role.harvester";
import { roleUpgrader } from "role.upgrader";
import { roleBuilder } from "role.builder";

export class RoomInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomEnergyAvailable: number;
  roomEnergyCapacityAvailable: number;
  roomStorage: StructureStorage | undefined;
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
    this.roomStorage = room.storage && room.storage.my ? room.storage : undefined;
    this.roomSpawner = new SpawnerInstance(room);
    this.roomSources = room.find(FIND_SOURCES);
    this.roomCreeps = new CreepsInstance(room);
    room.find(FIND_MY_CREEPS);
    this.roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    // roomTerminal = room.terminal;
    // roomStructures = room.find(FIND_STRUCTURES);
    // roomHostiles = room.find(FIND_HOSTILE_CREEPS);
    // roomMyStructures = room.find(FIND_MY_STRUCTURES);
    // roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
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

  run() {
    // activate safe mode if needed
    this.runSafeMode();

    // Spawn new creeps
    if (this.roomController && this.roomController.level <= 3) {
      if (this.roomCreeps.harvesters.length < this.roomSources.length) {
        this.roomSpawner.spawnQueueAdd(
          this.roomCreeps.newInitialCreep(
            "harvester",
            this.roomCreeps.harvesters.length < 2 ? 10 : 21
          )
        );
      }
      if (this.roomCreeps.upgraders.length < 1) {
        this.roomSpawner.spawnQueueAdd(this.roomCreeps.newInitialCreep("upgrader", 20));
      }

      if (this.roomCreeps.builders.length < 1) {
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