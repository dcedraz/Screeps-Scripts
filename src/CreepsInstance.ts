import { RoleHarvester } from "RoleHarvester";
import { RoleBuilder } from "RoleBuilder";
import { RoleUpgrader } from "RoleUpgrader";

export class CreepsInstance {
  constructor(
    public room: Room,
    public creeps: Creep[] = room.find(FIND_MY_CREEPS),
    public harvesters: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "harvester"),
    public upgraders: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "upgrader"),
    public builders: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "builder") // miners: Creep[] = _.filter(creeps, (creep) => creep.memory.role == 'miner');
  ) // haulers: Creep[] = _.filter(creeps, (creep) => creep.memory.role == 'hauler');
  {}

  // make creep walk over road
  walkOverRoad(creep: Creep) {
    let pos = creep.pos;
    let structure = pos.lookFor(LOOK_STRUCTURES);
    if (structure.length > 0) {
      if (structure[0].structureType === STRUCTURE_ROAD) {
        creep.move(creep.pos.getDirectionTo(structure[0].pos));
      }
    }
  }

  newInitialCreep(role: string, priory: number, source?: Source): SpawnWorkOrder {
    let name = "Initial_" + role + "-" + Game.time;
    let sourceId = source ? source.id : undefined;
    return {
      name: name,
      body: [WORK, CARRY, MOVE],
      memory: { role: role, working: false, room: this.room.name, assigned_source: sourceId },
      priority: priory,
    };
  }

  run() {
    // Run creep logic
    for (const creepName in this.creeps) {
      const creep = this.creeps[creepName];
      if (creep.memory.role === "harvester") {
        new RoleHarvester(creep).runInitial();
      }
      if (creep.memory.role === "upgrader") {
        new RoleUpgrader(creep).run();
      }
      if (creep.memory.role === "builder") {
        new RoleBuilder(creep).run();
      }
    }
  }
}
