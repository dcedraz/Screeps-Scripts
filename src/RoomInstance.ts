import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { StructuresInstance } from "StructuresInstance";
import { HelperFunctions } from "utils/HelperFunctions";

// Types for the functional approach
export interface RoomInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomSpawner: SpawnerInstance;
  roomSources: Source[];
  roomStructuresInstance: StructuresInstance;
  roomCreeps: CreepsInstance;
}

// Pure function to create room instance
export function createRoomInstance(room: Room): RoomInstance {
  return {
    room,
    roomController: room.controller,
    roomSpawner: new SpawnerInstance(room),
    roomSources: room.sources.filter(
      (source) => !HelperFunctions.isHostileNearby(source)
    ),
    roomStructuresInstance: new StructuresInstance(room, room.sources.filter(
      (source) => !HelperFunctions.isHostileNearby(source)
    )),
    roomCreeps: new CreepsInstance(room)
  };
}

// Pure function to run safe mode logic
export function runSafeMode(roomInstance: RoomInstance): void {
  const { roomController } = roomInstance;
  
  if (
    roomController &&
    roomController.level > 1 &&
    (!roomController.safeMode || roomController.safeMode < 1000) &&
    roomController.safeModeCooldown === undefined
  ) {
    roomController.activateSafeMode();
  }
}

// Pure function to find available sources
export function findAvailableSources(roomInstance: RoomInstance, creeps: Creep[]): Source[] {
  return roomInstance.roomSources.filter(
    (source) => creeps.filter((creep) => creep.memory.assigned_source === source.id).length === 0
  );
}

// Pure function to spawn harvesters
export function spawnHarvesters(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner, roomSources } = roomInstance;
  
  if (roomController && roomCreeps.harvesters.length < roomSources.length) {
    let targetSource = findAvailableSources(roomInstance, roomCreeps.harvesters)[0];
    roomSpawner.spawnQueueAdd(
      roomCreeps.newCreep(
        "harvester",
        roomCreeps.MyCreepBodies.harvesters,
        roomCreeps.harvesters.length < 2 ? 10 : 21,
        targetSource
      )
    );
  }
}

// Pure function to spawn haulers
export function spawnHaulers(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.haulers.length < roomCreeps.harvesters.length) {
    let targetSource = findAvailableSources(roomInstance, roomCreeps.haulers)[0];

    roomSpawner.spawnQueueAdd(
      roomCreeps.newCreep(
        "hauler",
        roomCreeps.MyCreepBodies.haulers,
        roomCreeps.harvesters.length < 2 ? 9 : 10,
        targetSource
      )
    );
  }
}

// Pure function to spawn upgraders
export function spawnUpgraders(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.upgraders.length < 3) {
    roomSpawner.spawnQueueAdd(
      roomCreeps.newCreep("upgrader", roomCreeps.MyCreepBodies.upgraders, 20)
    );
  }
}

// Pure function to spawn builders
export function spawnBuilders(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.builders.length < 1 && roomController.level > 1) {
    roomSpawner.spawnQueueAdd(
      roomCreeps.newCreep(
        "builder",
        roomCreeps.MyCreepBodies.builders,
        roomCreeps.builders.length < 1 ? 10 : 21
      )
    );
  }
}

// Pure function to run all spawn logic
export function runSpawnLogic(roomInstance: RoomInstance): void {
  spawnHarvesters(roomInstance);
  spawnHaulers(roomInstance);
  spawnUpgraders(roomInstance);
  spawnBuilders(roomInstance);
}

// Pure function to run all room logic
export function runRoom(roomInstance: RoomInstance): void {
  // activate safe mode if needed
  runSafeMode(roomInstance);

  // Run spawn logic
  runSpawnLogic(roomInstance);

  // Run creeps and spawner
  roomInstance.roomCreeps.run();
  roomInstance.roomSpawner.run();
}


