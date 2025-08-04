import { HelperFunctions } from "utils/HelperFunctions";

export interface SpawnerInstance {
  room: Room;
  spawns: StructureSpawn[];
  spawnQueue: SpawnWorkOrder[];
}

export function createSpawnerInstance(
  room: Room,
  spawns: StructureSpawn[] = room.structures.spawn,
  spawnQueue: SpawnWorkOrder[] = []
): SpawnerInstance {
  return {
    room,
    spawns,
    spawnQueue
  };
}

export function runSpawner(spawnerInstance: SpawnerInstance): void {
  if (spawnerInstance.spawnQueue.length) {
    //debuggQueue(spawnerInstance, "BEFORE");
    spawnQueueSort(spawnerInstance);
    //debuggQueue(spawnerInstance, "AFTER");
    spawnCreeps(spawnerInstance);
    spawnVisuals(spawnerInstance);
  }
}

export function debuggQueue(spawnerInstance: SpawnerInstance, text: String): void {
  spawnerInstance.spawnQueue.forEach((spawnRequest) => {
    console.log(JSON.stringify(spawnRequest, undefined, 4));
    console.log(
      text +
        ": " +
        JSON.stringify(spawnRequest.name + " - " + spawnRequest.priority, undefined, 4)
    );
  });
  // console.log(JSON.stringify(spawnerInstance.spawnQueue[0], undefined, 4));
}

// Spawn visuals
export function spawnVisuals(spawnerInstance: SpawnerInstance): void {
  for (const spawn of spawnerInstance.spawns) {
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text("🛠️" + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
        align: "left",
        opacity: 0.8,
      });
    }
  }
}

export function spawnCreeps(spawnerInstance: SpawnerInstance): void {
  const spawnRequest = spawnerInstance.spawnQueue[0];
  assignSpawn(spawnerInstance, spawnRequest);
  if (spawnRequest.assignedSpawn) {
    let targetSpawn = HelperFunctions.findObjectWithID(spawnRequest.assignedSpawn);
    if (targetSpawn) {
      if (
        targetSpawn.spawnCreep(spawnRequest.body, spawnRequest.name, {
          memory: spawnRequest.memory,
        })
      ) {
        spawnQueueRemove(spawnerInstance, spawnRequest);
      }
    }
  }
}

// sort queue by priority (ascending)
export function spawnQueueSort(spawnerInstance: SpawnerInstance): void {
  spawnerInstance.spawnQueue.sort((a, b) => {
    return a.priority - b.priority;
  });
}

export function assignSpawn(spawnerInstance: SpawnerInstance, order: SpawnWorkOrder): void {
  for (const spawn in spawnerInstance.spawns) {
    if (!spawnerInstance.spawns[spawn].spawning) {
      order.assignedSpawn = spawnerInstance.spawns[spawn].id;
    }
  }
}

export function spawnQueueAdd(spawnerInstance: SpawnerInstance, spawnRequest: SpawnWorkOrder): void {
  spawnerInstance.spawnQueue.push(spawnRequest);
  assignSpawn(spawnerInstance, spawnRequest);
}

export function spawnQueueRemove(spawnerInstance: SpawnerInstance, spawnRequest: SpawnWorkOrder): void {
  const index = spawnerInstance.spawnQueue.indexOf(spawnRequest);
  if (index > -1) {
    spawnerInstance.spawnQueue.splice(index, 1);
  }
}

export function spawnQueueClear(spawnerInstance: SpawnerInstance): void {
  spawnerInstance.spawnQueue = [];
}

export function spawnQueueSize(spawnerInstance: SpawnerInstance): number {
  return spawnerInstance.spawnQueue.length;
}

export function spawnQueueContains(spawnerInstance: SpawnerInstance, spawnRequest: SpawnWorkOrder): boolean {
  return spawnerInstance.spawnQueue.indexOf(spawnRequest) > -1;
}

export function spawnQueueContainsName(spawnerInstance: SpawnerInstance, name: string): boolean {
  for (const spawn in spawnerInstance.spawnQueue) {
    if (spawnerInstance.spawnQueue[spawn].name === name) {
      return true;
    }
  }
  return false;
}
