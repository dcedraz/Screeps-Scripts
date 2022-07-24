import { HelperFunctions } from "utils/HelperFunctions";

export class SpawnerInstance {
  constructor(
    public room: Room,
    public spawns: StructureSpawn[] = room.structures.spawn,
    public spawnQueue: SpawnWorkOrder[] = []
  ) {}

  run() {
    if (this.spawnQueue.length) {
      //this.debuggQueue("BEFORE");
      this.spawnQueueSort();
      //this.debuggQueue("AFTER");
      this.spawnCreeps();
      this.spawnVisuals();
    }
  }
  debuggQueue(text: String): void {
    this.spawnQueue.forEach((spawnRequest) => {
      console.log(JSON.stringify(spawnRequest, undefined, 4));
      console.log(
        text +
          ": " +
          JSON.stringify(spawnRequest.name + " - " + spawnRequest.priority, undefined, 4)
      );
    });
    // console.log(JSON.stringify(this.spawnQueue[0], undefined, 4));
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
      let targetSpawn = HelperFunctions.findObjectWithID(spawnRequest.assignedSpawn);
      if (targetSpawn) {
        if (
          targetSpawn.spawnCreep(spawnRequest.body, spawnRequest.name, {
            memory: spawnRequest.memory,
          })
        ) {
          this.spawnQueueRemove(spawnRequest);
        }
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
        order.assignedSpawn = this.spawns[spawn].id;
      }
    }
  }

  spawnQueueAdd(spawnRequest: SpawnWorkOrder) {
    this.spawnQueue.push(spawnRequest);
    this.assignSpawn(spawnRequest);
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
