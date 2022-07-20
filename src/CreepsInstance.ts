import { RoleHarvester } from "creep roles/RoleHarvester";
import { RoleHauler } from "creep roles/RoleHauler";
import { RoleBuilder } from "creep roles/RoleBuilder";
import { RoleUpgrader } from "creep roles/RoleUpgrader";

export class CreepsInstance {
  constructor(
    public room: Room,
    public creeps: Creep[] = room.find(FIND_MY_CREEPS),
    public harvesters: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "harvester"),
    public haulers: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "hauler"),
    public upgraders: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "upgrader"),
    public builders: Creep[] = _.filter(creeps, (creep) => creep.memory.role == "builder"),
    public MyCreepBodies = {
      harvesters: [WORK, WORK, MOVE],
      haulers: [CARRY, MOVE, CARRY, MOVE],
      upgraders: [WORK, CARRY, MOVE],
      builders: [WORK, CARRY, MOVE],
    }
  ) {}

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

  newCreep(
    role: string,
    body: BodyPartConstant[],
    priory: number,
    source?: Source
  ): SpawnWorkOrder {
    let name = "Initial_" + role + "-" + Game.time;
    let sourceId = source ? source.id : undefined;
    return {
      name: name,
      body: body,
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
      if (creep.memory.role === "hauler") {
        new RoleHauler(creep).run();
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
