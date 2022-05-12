import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { StructuresInstance } from "StructuresInstance";
import { HelperFunctions } from "utils/HelperFunctions";

export class RoomInstance {
  constructor(
    public room: Room,
    public roomController: StructureController | undefined = room.controller,
    public roomEnergyAvailable: number = room.energyAvailable,
    public roomEnergyCapacityAvailable: number = room.energyCapacityAvailable,
    public roomSpawner: SpawnerInstance = new SpawnerInstance(room),
    public roomSources: Source[] = [],
    public roomCreeps: CreepsInstance = new CreepsInstance(room),
    public roomMyConstructionSites: ConstructionSite[] = room.find(FIND_MY_CONSTRUCTION_SITES),
    public roomMyStructures: StructuresInstance = new StructuresInstance(room, roomSources)
  ) {}
  // roomTerminal = room.terminal;
  // roomStructures = room.find(FIND_STRUCTURES);
  // roomHostiles = room.find(FIND_HOSTILE_CREEPS);
  // roomMyStructures = room.find(FIND_MY_STRUCTURES);

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

  findAvailableSources(): void {
    let sources = this.room.find(FIND_SOURCES);
    this.roomSources = sources.filter(
      (source) =>
        !HelperFunctions.isHostileNearby(source) &&
        this.roomCreeps.harvesters.filter((creep) => creep.memory.assigned_source === source.id)
          .length === 0
    );
  }

  run() {
    // activate safe mode if needed
    this.runSafeMode();

    // Spawn harvesters
    if (this.roomController && this.roomController.level <= 3) {
      if (
        this.roomCreeps.harvesters.length < this.roomSources.length ||
        this.roomSources.length == 0
      ) {
        this.findAvailableSources();
        this.roomSpawner.spawnQueueAdd(
          this.roomCreeps.newInitialCreep(
            "harvester",
            this.roomCreeps.harvesters.length < 2 ? 10 : 21,
            this.roomSources[0]
          )
        );
      }

      // Spawn upgraders
      if (this.roomCreeps.upgraders.length < this.roomController.level) {
        this.roomSpawner.spawnQueueAdd(this.roomCreeps.newInitialCreep("upgrader", 20));
      }

      // Spawn builders
      if (
        this.roomCreeps.builders.length < this.roomController.level &&
        this.roomController.level > 1
      ) {
        this.roomSpawner.spawnQueueAdd(
          this.roomCreeps.newInitialCreep("builder", this.roomCreeps.builders.length < 1 ? 10 : 21)
        );
      }
    }

    this.roomSpawner.run();
    this.roomCreeps.run();
    this.roomMyStructures.run();
    // this.roomTerminal.run();
    // this.roomStructures.run();
    // this.roomHostiles.run();
    // this.roomMyStructures.run();
    // this.roomMyConstructionSites.run();
  }
}
