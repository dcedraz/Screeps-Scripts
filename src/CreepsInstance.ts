import { roleUpgrader } from "role.upgrader";
import { roleHarvester } from "role.harvester";
import { roleBuilder } from "role.builder";

export class CreepsInstance {
  room: Room;
  creeps: Creep[];
  harvesters: Creep[];
  upgraders: Creep[];
  builders: Creep[];
  // miners: Creep[];
  // haulers: Creep[];

  constructor(room: Room) {
    this.room = room;
    this.creeps = room.find(FIND_MY_CREEPS);
    this.harvesters = _.filter(this.creeps, (creep) => creep.memory.role == "harvester");
    this.upgraders = _.filter(this.creeps, (creep) => creep.memory.role == "upgrader");
    this.builders = _.filter(this.creeps, (creep) => creep.memory.role == "builder");
    // this.miners = _.filter(this.creeps, (creep) => creep.memory.role == 'miner');
    // this.haulers = _.filter(this.creeps, (creep) => creep.memory.role == 'hauler');
  }

  newInitialCreep(role: string, priory: number): SpawnWorkOrder {
    let name = role + Game.time;
    return {
      name: name,
      body: [WORK, CARRY, MOVE],
      memory: { role: role, working: false, room: this.room.name },
      priority: priory,
    };
  }

  run() {
    // Run creep logic
    for (const creepName in this.creeps) {
      const creep = this.creeps[creepName];
      if (creep.memory.role === "harvester") {
        roleHarvester.run(creep);
      }
      if (creep.memory.role === "upgrader") {
        roleUpgrader.run(creep);
      }
      if (creep.memory.role === "builder") {
        roleBuilder.run(creep);
      }
    }
  }
}
