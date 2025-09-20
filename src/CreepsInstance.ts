import { runHarvesterRole } from "creep_roles/RoleHarvester";
import { runHaulerRole } from "creep_roles/RoleHauler";
import { runBuilderRole } from "creep_roles/RoleBuilder";
import { runUpgraderRole } from "creep_roles/RoleUpgrader";

export interface CreepsInstance {
  room: Room;
  creeps: Creep[];
  harvesters: Creep[];
  haulers: Creep[];
  upgraders: Creep[];
  builders: Creep[];
  creepBodies: CreepBodiesConfig;
}

export interface CreepBodiesConfig {
  harvesters: BodyPartConstant[];
  haulers: BodyPartConstant[];
  upgraders: BodyPartConstant[];
  builders: BodyPartConstant[];
}

export type CreepRoleFunction = (creep: Creep) => void;

// Factory function for creating CreepsInstance
export function createCreepsInstance(room: Room): CreepsInstance {
  const creeps = getCreepsByRoom(room);
  return {
    room,
    creeps,
    harvesters: filterCreepsByRole(creeps, 'harvester'),
    haulers: filterCreepsByRole(creeps, 'hauler'),
    upgraders: filterCreepsByRole(creeps, 'upgrader'),
    builders: filterCreepsByRole(creeps, 'builder'),
    creepBodies: getDefaultCreepBodies()
  };
}

// Helper functions
export function filterCreepsByRole(creeps: Creep[], role: string): Creep[] {
  return _.filter(creeps, (creep) => creep.memory.role === role);
}

export function getCreepsByRoom(room: Room): Creep[] {
  return room.myCreeps;
}

export function getDefaultCreepBodies(): CreepBodiesConfig {
  return {
    harvesters: [WORK, WORK, MOVE],
    haulers: [CARRY, MOVE, CARRY, MOVE],
    upgraders: [WORK, CARRY, MOVE],
    builders: [WORK, CARRY, MOVE],
  };
}

export function getCreepBodyForRole(role: string, bodiesConfig: CreepBodiesConfig): BodyPartConstant[] {
  switch (role) {
    case 'harvester':
      return bodiesConfig.harvesters;
    case 'hauler':
      return bodiesConfig.haulers;
    case 'upgrader':
      return bodiesConfig.upgraders;
    case 'builder':
      return bodiesConfig.builders;
    default:
      return [];
  }
}

// Core functional methods
export function createSpawnWorkOrder(
  role: string,
  body: BodyPartConstant[],
  priority: number,
  roomName: string,
  source?: Source
): SpawnWorkOrder {
  const name = "Initial_" + role + "-" + Game.time;
  const sourceId = source ? source.id : undefined;
  return {
    name: name,
    body: body,
    memory: { role: role, working: false, room: roomName, assigned_source: sourceId },
    priority: priority,
  };
}

export function moveCreepOverRoad(creep: Creep): void {
  const pos = creep.pos;
  const structures = pos.lookFor(LOOK_STRUCTURES);
  if (structures.length > 0) {
    const structure = structures[0];
    if (structure.structureType === STRUCTURE_ROAD) {
      creep.move(creep.pos.getDirectionTo(structure.pos));
    }
  }
}

export function runCreeps(creepsInstance: CreepsInstance): void {
  for (const creep of creepsInstance.creeps) {
    if (creep.memory.role === "harvester") {
      runHarvesterRole(creep);
    }
    if (creep.memory.role === "hauler") {
      runHaulerRole(creep);
    }
    if (creep.memory.role === "upgrader") {
      runUpgraderRole(creep);
    }
    if (creep.memory.role === "builder") {
      runBuilderRole(creep);
    }
  }
}
