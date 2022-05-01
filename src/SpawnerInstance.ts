import { HelperFunctions } from "utils/HelperFunctions";

export class SpawnerInstance {
  spawns: StructureSpawn[];
  spawnQueue: SpawnWorkOrder[];

  constructor(room: Room) {
    this.spawns = room.find(FIND_MY_SPAWNS);
    this.spawnQueue = [];
  }
  run(): void {
    if (this.spawnQueue.length) {
      // Debugging
      //   this.spawnQueue.forEach((spawnRequest) => {
      //     console.log(
      //       "BEFORE: " +
      //         JSON.stringify(spawnRequest.name + " - " + spawnRequest.priority, undefined, 4)
      //     );
      //   });

      this.spawnQueueSort();

      // Debugging
      //   this.spawnQueue.forEach((spawnRequest) => {
      //     console.log(
      //       "AFTER: " +
      //         JSON.stringify(spawnRequest.name + " - " + spawnRequest.priority, undefined, 4)
      //     );
      //   });

      this.spawnCreeps();
      this.spawnVisuals();
    }
  }
  // Spawn visuals
  spawnVisuals(): void {
    for (const spawn of this.spawns) {
      if (spawn.spawning) {
        const spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text("🛠️" + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
          align: "left",
          opacity: 0.8,
        });
      }
    }
  }

  spawnCreeps(): void {
    const spawnRequest = this.spawnQueue[0];
    this.assignSpawn(spawnRequest);
    if (spawnRequest.assignedSpawn) {
      if (
        spawnRequest.assignedSpawn.spawnCreep(spawnRequest.body, spawnRequest.name, {
          memory: spawnRequest.memory,
        })
      ) {
        this.spawnQueueRemove(spawnRequest);
      }
    }
  }
  // sort queue by priority (ascending)
  spawnQueueSort(): void {
    this.spawnQueue.sort((a, b) => {
      return a.priority - b.priority;
    });
  }

  assignSpawn(order: SpawnWorkOrder): void {
    for (const spawn in this.spawns) {
      if (!this.spawns[spawn].spawning) {
        order.assignedSpawn = this.spawns[spawn];
      }
    }
  }

  spawnQueueAdd(spawnRequest: SpawnWorkOrder): void {
    this.spawnQueue.push(spawnRequest);
  }

  spawnQueueRemove(spawnRequest: SpawnWorkOrder): void {
    const index = this.spawnQueue.indexOf(spawnRequest);
    if (index > -1) {
      this.spawnQueue.splice(index, 1);
    }
  }

  spawnQueueClear(): void {
    this.spawnQueue = [];
  }

  spawnQueueSize(): number {
    return this.spawnQueue.length;
  }

  spawnQueueContains(spawnRequest: SpawnWorkOrder): boolean {
    return this.spawnQueue.indexOf(spawnRequest) > -1;
  }

  spawnQueueContainsName(name: string): boolean {
    for (const spawn in this.spawnQueue) {
      if (this.spawnQueue[spawn].name === name) {
        return true;
      }
    }
    return false;
  }
}
