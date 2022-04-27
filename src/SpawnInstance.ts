// TODO: Update spawnCreeps to work with priority queues

export class SpawnInstance {
    
    spawns: StructureSpawn[];
    spawnQueue: SpawnWorkOrder[];

    constructor (spawn: StructureSpawn[]) {
        this.spawns = spawn;
        this.spawnQueue = [];
        if(this.spawnQueue.length) {
            this.spawnQueueSort();
        }
        if(this.spawns.length) {
            this.spawnCreeps();
        }
    }  

    spawnCreeps(): void {
        for (const order in this.spawnQueue) {
            const spawnRequest = this.spawnQueue[order];
            this.assignSpawn(spawnRequest);
            if (spawnRequest.assignedSpawn) {
                if (spawnRequest.assignedSpawn.spawnCreep(spawnRequest.body, spawnRequest.name,
                    {memory: spawnRequest.memory})) {
                    this.spawnQueueRemove(spawnRequest);                   
                }                
            }
        }
    }
    // sort array by priority
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

interface SpawnWorkOrder {
    name: string;
    body: BodyPartConstant[];
    memory: CreepMemory;
    priority: number;
    assignedSpawn: StructureSpawn;
}