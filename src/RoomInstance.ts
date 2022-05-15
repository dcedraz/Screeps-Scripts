import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { StructuresInstance } from "StructuresInstance";
import { HelperFunctions } from "utils/HelperFunctions";

export class RoomInstance {
  constructor(
    public room: Room,
    public roomController: StructureController | undefined = room.controller,
    public roomSpawner: SpawnerInstance = new SpawnerInstance(room),
    public roomSources: Source[] = room.find(FIND_SOURCES, {
      filter: (source) => !HelperFunctions.isHostileNearby(source),
    }),
    public roomStructuresInstance: StructuresInstance = new StructuresInstance(room, roomSources),
    public roomCreeps: CreepsInstance = new CreepsInstance(
      room,
      roomStructuresInstance.myConstructionSites
    )
  ) {}
  // public roomEnergyAvailable: number = room.energyAvailable,
  // public roomEnergyCapacityAvailable: number = room.energyCapacityAvailable,
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
        let targetSource = this.findAvailableSources()[0];
        this.roomSpawner.spawnQueueAdd(
          this.roomCreeps.newInitialCreep(
            "harvester",
            this.roomCreeps.harvesters.length < 2 ? 10 : 21,
            targetSource
          )
        );
      }

      // Spawn upgraders
      if (this.roomCreeps.upgraders.length < 1) {
        this.roomSpawner.spawnQueueAdd(this.roomCreeps.newInitialCreep("upgrader", 20));
      }

      // Spawn builders
      if (this.roomCreeps.builders.length < 1 && this.roomController.level > 1) {
        this.roomSpawner.spawnQueueAdd(
          this.roomCreeps.newInitialCreep("builder", this.roomCreeps.builders.length < 1 ? 10 : 21)
        );
      }
    }

    this.roomSpawner.run();
    this.roomCreeps.run();
    this.roomStructuresInstance.run();
    // this.roomTerminal.run();
    // this.roomStructures.run();
    // this.roomHostiles.run();
    // this.roomMyStructures.run();
    // this.roomMyConstructionSites.run();
  }
}
