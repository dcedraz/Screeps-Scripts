import { mockInstanceOf, mockGlobal } from 'screeps-jest';

// Mock Screeps globals before importing user code
mockGlobal<Game>('Game', {
  time: 12345,
});

import { 
  CreepsInstance, 
  createCreepsInstance, 
  createSpawnWorkOrder,
  moveCreepOverRoad,
  runCreeps,
  filterCreepsByRole,
  getCreepsByRoom,
  getDefaultCreepBodies,
  getCreepBodyForRole
} from '../../src/CreepsInstance';

// Mock the role functions
jest.mock('../../src/creep_roles/RoleHarvester', () => ({
  runHarvesterRole: jest.fn(),
  RoleHarvester: jest.fn()
}));

jest.mock('../../src/creep_roles/RoleHauler', () => ({
  runHaulerRole: jest.fn(),
  RoleHauler: jest.fn()
}));

jest.mock('../../src/creep_roles/RoleUpgrader', () => ({
  runUpgraderRole: jest.fn(),
  RoleUpgrader: jest.fn()
}));

jest.mock('../../src/creep_roles/RoleBuilder', () => ({
  runBuilderRole: jest.fn(),
  RoleBuilder: jest.fn()
}));

const { runHarvesterRole } = require('../../src/creep_roles/RoleHarvester');
const { runHaulerRole } = require('../../src/creep_roles/RoleHauler');
const { runUpgraderRole } = require('../../src/creep_roles/RoleUpgrader');
const { runBuilderRole } = require('../../src/creep_roles/RoleBuilder');

describe('CreepsInstance', () => {
  const room = mockInstanceOf<Room>({ 
    name: 'W1N1',
    myCreeps: []
  });

  describe('createCreepsInstance', () => {
    it('should create a CreepsInstance with correct room', () => {
      const creepsInstance = createCreepsInstance(room);
      expect(creepsInstance.room).toBe(room);
    });

    it('should filter creeps by role correctly', () => {
      const harvester = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
      const hauler = mockInstanceOf<Creep>({ memory: { role: 'hauler' } });
      const upgrader = mockInstanceOf<Creep>({ memory: { role: 'upgrader' } });
      const builder = mockInstanceOf<Creep>({ memory: { role: 'builder' } });
      
      const roomWithCreeps = mockInstanceOf<Room>({ 
        name: 'W1N1',
        myCreeps: [harvester, hauler, upgrader, builder]
      });

      const creepsInstance = createCreepsInstance(roomWithCreeps);
      
      expect(creepsInstance.harvesters).toEqual([harvester]);
      expect(creepsInstance.haulers).toEqual([hauler]);
      expect(creepsInstance.upgraders).toEqual([upgrader]);
      expect(creepsInstance.builders).toEqual([builder]);
    });

    it('should include default creep bodies configuration', () => {
      const creepsInstance = createCreepsInstance(room);
      expect(creepsInstance.creepBodies).toBeDefined();
      expect(creepsInstance.creepBodies.harvesters).toBeDefined();
      expect(creepsInstance.creepBodies.haulers).toBeDefined();
      expect(creepsInstance.creepBodies.upgraders).toBeDefined();
      expect(creepsInstance.creepBodies.builders).toBeDefined();
    });
  });

  describe('createSpawnWorkOrder', () => {
    it('should create a spawn work order with correct properties', () => {
      const body = [WORK, CARRY, MOVE];
      const source = mockInstanceOf<Source>({ id: 'source1' as Id<Source> });
      
      const order = createSpawnWorkOrder('harvester', body, 1, room.name, source);
      
      expect(order.name).toMatch(/Initial_harvester-\d+/);
      expect(order.body).toEqual(body);
      expect(order.memory.role).toBe('harvester');
      expect(order.memory.working).toBe(false);
      expect(order.memory.room).toBe(room.name);
      expect(order.memory.assigned_source).toBe(source.id);
      expect(order.priority).toBe(1);
    });

    it('should create spawn work order without source when not provided', () => {
      const body = [WORK, CARRY, MOVE];
      
      const order = createSpawnWorkOrder('upgrader', body, 2, room.name);
      
      expect(order.memory.assigned_source).toBeUndefined();
    });
  });

  describe('helper functions', () => {
    it('filterCreepsByRole should filter creeps by specified role', () => {
      const harvester1 = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
      const harvester2 = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
      const hauler = mockInstanceOf<Creep>({ memory: { role: 'hauler' } });
      const creeps = [harvester1, hauler, harvester2];

      const harvesters = filterCreepsByRole(creeps, 'harvester');
      
      expect(harvesters).toEqual([harvester1, harvester2]);
    });

    it('getCreepsByRoom should return all creeps in the room', () => {
      const creep1 = mockInstanceOf<Creep>({});
      const creep2 = mockInstanceOf<Creep>({});
      const roomWithCreeps = mockInstanceOf<Room>({ 
        myCreeps: [creep1, creep2]
      });

      const creeps = getCreepsByRoom(roomWithCreeps);
      
      expect(creeps).toEqual([creep1, creep2]);
    });

    it('getDefaultCreepBodies should return default body configurations', () => {
      const bodies = getDefaultCreepBodies();
      
      expect(bodies.harvesters).toEqual([WORK, WORK, MOVE]);
      expect(bodies.haulers).toEqual([CARRY, MOVE, CARRY, MOVE]);
      expect(bodies.upgraders).toEqual([WORK, CARRY, MOVE]);
      expect(bodies.builders).toEqual([WORK, CARRY, MOVE]);
    });

    it('getCreepBodyForRole should return correct body for role', () => {
      const bodies = getDefaultCreepBodies();
      
      expect(getCreepBodyForRole('harvester', bodies)).toEqual([WORK, WORK, MOVE]);
      expect(getCreepBodyForRole('hauler', bodies)).toEqual([CARRY, MOVE, CARRY, MOVE]);
    });
  });

  describe('moveCreepOverRoad', () => {
    it('should move creep if standing on a road', () => {
      const road = mockInstanceOf<StructureRoad>({ 
        structureType: STRUCTURE_ROAD,
        pos: { x: 10, y: 10 }
      });
      const creep = mockInstanceOf<Creep>({
        pos: {
          lookFor: jest.fn(() => [road]),
          getDirectionTo: jest.fn(() => TOP)
        },
        move: jest.fn(() => OK)
      });

      moveCreepOverRoad(creep);

      expect(creep.move).toHaveBeenCalledWith(TOP);
    });

    it('should not move creep if not on a road', () => {
      const creep = mockInstanceOf<Creep>({
        pos: {
          lookFor: jest.fn(() => [])
        },
        move: jest.fn()
      });

      moveCreepOverRoad(creep);

      expect(creep.move).not.toHaveBeenCalled();
    });
  });

  describe('runCreeps', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call functional role implementations for each creep type', () => {
      const harvester = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
      const hauler = mockInstanceOf<Creep>({ memory: { role: 'hauler' } });
      const upgrader = mockInstanceOf<Creep>({ memory: { role: 'upgrader' } });
      const builder = mockInstanceOf<Creep>({ memory: { role: 'builder' } });
      
      const creepsInstance: CreepsInstance = {
        room: mockInstanceOf<Room>({ name: 'W1N1' }),
        creeps: [harvester, hauler, upgrader, builder],
        harvesters: [harvester],
        haulers: [hauler],
        upgraders: [upgrader],
        builders: [builder],
        creepBodies: getDefaultCreepBodies()
      };

      runCreeps(creepsInstance);

      expect(runHarvesterRole).toHaveBeenCalledWith(harvester);
      expect(runHaulerRole).toHaveBeenCalledWith(hauler);
      expect(runUpgraderRole).toHaveBeenCalledWith(upgrader);
      expect(runBuilderRole).toHaveBeenCalledWith(builder);
    });

    it('should handle multiple creeps of the same role', () => {
      const harvester1 = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
      const harvester2 = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
      
      const creepsInstance: CreepsInstance = {
        room: mockInstanceOf<Room>({ name: 'W1N1' }),
        creeps: [harvester1, harvester2],
        harvesters: [harvester1, harvester2],
        haulers: [],
        upgraders: [],
        builders: [],
        creepBodies: getDefaultCreepBodies()
      };

      runCreeps(creepsInstance);

      expect(runHarvesterRole).toHaveBeenCalledTimes(2);
      expect(runHarvesterRole).toHaveBeenCalledWith(harvester1);
      expect(runHarvesterRole).toHaveBeenCalledWith(harvester2);
    });

    it('should handle creeps with unknown roles gracefully', () => {
      const unknownCreep = mockInstanceOf<Creep>({ memory: { role: 'unknown' } });
      
      const creepsInstance: CreepsInstance = {
        room: mockInstanceOf<Room>({ name: 'W1N1' }),
        creeps: [unknownCreep],
        harvesters: [],
        haulers: [],
        upgraders: [],
        builders: [],
        creepBodies: getDefaultCreepBodies()
      };

      expect(() => runCreeps(creepsInstance)).not.toThrow();
      expect(runHarvesterRole).not.toHaveBeenCalled();
      expect(runHaulerRole).not.toHaveBeenCalled();
      expect(runUpgraderRole).not.toHaveBeenCalled();
      expect(runBuilderRole).not.toHaveBeenCalled();
    });
  });
});
