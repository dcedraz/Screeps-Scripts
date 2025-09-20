import { mockInstanceOf, mockGlobal } from 'screeps-jest';

// Mock Screeps globals before importing user code
mockGlobal<Game>('Game', {
  time: 12345,
  getObjectById: jest.fn(),
});

import { runHarvesterRole } from '../../../src/creep_roles/RoleHarvester';

// Functional approach tests
describe('runHarvesterRole (Functional)', () => {
  it('should make harvester harvest from assigned source', () => {
    const source = mockInstanceOf<Source>({ 
      id: 'source1' as Id<Source>,
      pos: {
        findInRange: jest.fn(() => [])
      }
    });
    const creep = mockInstanceOf<Creep>({
      memory: { 
        role: 'harvester', 
        assigned_source: source.id,
        working: false 
      },
      store: { getUsedCapacity: jest.fn(() => 0) },
      harvest: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      pos: {
        findInRange: jest.fn(() => [])
      }
    });

    (Game.getObjectById as jest.Mock).mockReturnValue(source);

    runHarvesterRole(creep);

    expect(creep.harvest).toHaveBeenCalledWith(source);
  });

  it('should repair nearby containers when creep has energy', () => {
    const container = mockInstanceOf<StructureContainer>({
      structureType: STRUCTURE_CONTAINER,
      hits: 500,
      hitsMax: 1000
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { 
        role: 'harvester', 
        working: false,
        assigned_source: undefined
      },
      store: { getUsedCapacity: jest.fn(() => 50) },
      pos: {
        findInRange: jest.fn(() => [container])
      },
      repair: jest.fn(() => OK),
      transfer: jest.fn(() => OK),
      harvest: jest.fn(() => OK),
      moveTo: jest.fn(() => OK),
      room: {
        sources: [mockInstanceOf<Source>({})]
      }
    });

    runHarvesterRole(creep);

    expect(creep.repair).toHaveBeenCalledWith(container);
  });

  it('should give energy to nearby non-harvester creeps', () => {
    const nearbyCreep = mockInstanceOf<Creep>({
      memory: { role: 'hauler' }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { 
        role: 'harvester', 
        working: false,
        assigned_source: undefined
      },
      store: { getUsedCapacity: jest.fn(() => 50) },
      pos: {
        findInRange: jest.fn((type, range, filter) => {
          if (type === FIND_STRUCTURES) return [];
          if (type === FIND_MY_CREEPS) return [nearbyCreep];
          return [];
        })
      },
      transfer: jest.fn(() => OK),
      harvest: jest.fn(() => OK),
      moveTo: jest.fn(() => OK),
      room: {
        sources: [mockInstanceOf<Source>({})]
      }
    });

    runHarvesterRole(creep);

    expect(creep.transfer).toHaveBeenCalledWith(nearbyCreep, RESOURCE_ENERGY);
  });
});
