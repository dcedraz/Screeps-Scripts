import { SpawnerInstance, createSpawnerInstance, spawnQueueAdd, runSpawner } from "SpawnerInstance";
import { CreepsInstance, createCreepsInstance, createSpawnWorkOrder, runCreeps } from "CreepsInstance";
import { StructuresData, createStructuresData } from "StructuresInstance";
import { HelperFunctions } from "utils/HelperFunctions";

export interface RoomInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomSpawner: SpawnerInstance;
  roomSources: Source[];
  roomStructuresData: StructuresData;
  roomCreeps: CreepsInstance;
}

export function createRoomInstance(room: Room): RoomInstance {
  const sources = room.sources.filter(
    (source) => !HelperFunctions.isHostileNearby(source)
  );
  
  return {
    room,
    roomController: room.controller,
    roomSpawner: createSpawnerInstance(room),
    roomSources: sources,
    roomStructuresData: createStructuresData(room, sources),
    roomCreeps: createCreepsInstance(room)
  };
}

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

export function findAvailableSources(roomInstance: RoomInstance, creeps: Creep[]): Source[] {
  return roomInstance.roomSources.filter(
    (source) => creeps.filter((creep) => creep.memory.assigned_source === source.id).length === 0
  );
}

export function spawnHarvesters(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner, roomSources } = roomInstance;
  
  if (roomController && roomCreeps.harvesters.length < roomSources.length) {
    let targetSource = findAvailableSources(roomInstance, roomCreeps.harvesters)[0];
    spawnQueueAdd(
      roomSpawner,
      createSpawnWorkOrder(
        "harvester",
        roomCreeps.creepBodies.harvesters,
        roomCreeps.harvesters.length < 2 ? 10 : 21,
        roomInstance.room.name,
        targetSource
      )
    );
  }
}

export function spawnHaulers(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.haulers.length < roomCreeps.harvesters.length) {
    let targetSource = findAvailableSources(roomInstance, roomCreeps.haulers)[0];

    spawnQueueAdd(
      roomSpawner,
      createSpawnWorkOrder(
        "hauler",
        roomCreeps.creepBodies.haulers,
        roomCreeps.harvesters.length < 2 ? 9 : 10,
        roomInstance.room.name,
        targetSource
      )
    );
  }
}

export function spawnUpgraders(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.upgraders.length < 3) {
    spawnQueueAdd(
      roomSpawner,
      createSpawnWorkOrder("upgrader", roomCreeps.creepBodies.upgraders, 20, roomInstance.room.name)
    );
  }
}

export function spawnBuilders(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.builders.length < 1 && roomController.level > 1) {
    spawnQueueAdd(
      roomSpawner,
      createSpawnWorkOrder(
        "builder",
        roomCreeps.creepBodies.builders,
        roomCreeps.builders.length < 1 ? 10 : 21,
        roomInstance.room.name
      )
    );
  }
}

export function runSpawnLogic(roomInstance: RoomInstance): void {
  spawnHarvesters(roomInstance);
  spawnHaulers(roomInstance);
  spawnUpgraders(roomInstance);
  spawnBuilders(roomInstance);
}

export function runRoom(roomInstance: RoomInstance): void {
  runSafeMode(roomInstance);
  runSpawnLogic(roomInstance);
  runCreeps(roomInstance.roomCreeps);
  runSpawner(roomInstance.roomSpawner);
}
