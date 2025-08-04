import { SpawnerInstance, createSpawnerInstance, spawnQueueAdd, runSpawner } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { StructuresInstance } from "StructuresInstance";
import { HelperFunctions } from "utils/HelperFunctions";

export interface RoomInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomSpawner: SpawnerInstance;
  roomSources: Source[];
  roomStructuresInstance: StructuresInstance;
  roomCreeps: CreepsInstance;
}

export function createRoomInstance(room: Room): RoomInstance {
  return {
    room,
    roomController: room.controller,
    roomSpawner: createSpawnerInstance(room),
    roomSources: room.sources.filter(
      (source) => !HelperFunctions.isHostileNearby(source)
    ),
    roomStructuresInstance: new StructuresInstance(room, room.sources.filter(
      (source) => !HelperFunctions.isHostileNearby(source)
    )),
    roomCreeps: new CreepsInstance(room)
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
      roomCreeps.newCreep(
        "harvester",
        roomCreeps.MyCreepBodies.harvesters,
        roomCreeps.harvesters.length < 2 ? 10 : 21,
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
      roomCreeps.newCreep(
        "hauler",
        roomCreeps.MyCreepBodies.haulers,
        roomCreeps.harvesters.length < 2 ? 9 : 10,
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
      roomCreeps.newCreep("upgrader", roomCreeps.MyCreepBodies.upgraders, 20)
    );
  }
}

export function spawnBuilders(roomInstance: RoomInstance): void {
  const { roomController, roomCreeps, roomSpawner } = roomInstance;
  
  if (roomController && roomCreeps.builders.length < 1 && roomController.level > 1) {
    spawnQueueAdd(
      roomSpawner,
      roomCreeps.newCreep(
        "builder",
        roomCreeps.MyCreepBodies.builders,
        roomCreeps.builders.length < 1 ? 10 : 21
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
  roomInstance.roomCreeps.run();
  runSpawner(roomInstance.roomSpawner);
}
