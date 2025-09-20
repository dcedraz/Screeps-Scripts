import { mockInstanceOf, mockGlobal } from 'screeps-jest';

mockGlobal<Game>('Game', {
  time: 12345,
  getObjectById: jest.fn(),
});

import { runHaulerRole } from '../../../src/creep_roles/RoleHauler';

jest.mock('../../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    isContainer: jest.fn(() => true),
    getGreatestEnergyDrop: jest.fn(() => undefined),
    getRoomStructuresArray: jest.fn(() => []),
    isExtension: jest.fn(() => false),
    isStorage: jest.fn(() => false),
    isTower: jest.fn(() => false),
    isSpawn: jest.fn(() => false),
  }
}));

const HelperFunctions = require('../../../src/utils/HelperFunctions').HelperFunctions;

// Functional approach tests
describe('runHaulerRole (Functional)', () => {
  it('should collect energy from containers when empty', () => {
    const container = mockInstanceOf<StructureContainer>({
      structureType: STRUCTURE_CONTAINER,
      store: { getUsedCapacity: jest.fn(() => 500) }
    });
    
    const source = mockInstanceOf<Source>({
      id: 'source1' as Id<Source>,
      pos: {
        findInRange: jest.fn((type) => {
          if (type === FIND_DROPPED_RESOURCES) return [];
          if (type === FIND_STRUCTURES) return [container];
          return [];
        })
      }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { 
        role: 'hauler', 
        working: false,
        assigned_source: source.id
      },
      store: { 
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50)
      },
      pos: { 
        isNearTo: jest.fn(() => false),
        findInRange: jest.fn(() => [])
      },
      moveTo: jest.fn(() => OK),
      withdraw: jest.fn(() => OK)
    });

    (Game.getObjectById as jest.Mock).mockReturnValue(source);
    HelperFunctions.isContainer.mockReturnValue(true);
    HelperFunctions.getGreatestEnergyDrop.mockReturnValue(undefined);

    runHaulerRole(creep);

    expect(creep.moveTo).toHaveBeenCalledWith(container, expect.anything());
    expect(creep.withdraw).toHaveBeenCalledWith(container, RESOURCE_ENERGY);
  });

  it('should deliver energy to spawn when full', () => {
    const spawn = mockInstanceOf<StructureSpawn>({
      structureType: STRUCTURE_SPAWN,
      store: { getFreeCapacity: jest.fn(() => 100) }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'hauler', working: true },
      store: { getUsedCapacity: jest.fn(() => 50) },
      transfer: jest.fn(() => OK),
      moveTo: jest.fn(() => OK),
      pos: { 
        isNearTo: jest.fn(() => false),
        findInRange: jest.fn(() => [])
      },
      room: {}
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([spawn]);
    HelperFunctions.isSpawn.mockReturnValue(true);
    HelperFunctions.isExtension.mockReturnValue(false);
    HelperFunctions.isTower.mockReturnValue(false);
    HelperFunctions.isStorage.mockReturnValue(false);

    runHaulerRole(creep);

    expect(creep.transfer).toHaveBeenCalledWith(spawn, RESOURCE_ENERGY);
  });

  it('should give energy to nearby builder or upgrader creeps', () => {
    const builderCreep = mockInstanceOf<Creep>({
      memory: { role: 'builder' }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'hauler', working: true },
      store: { getUsedCapacity: jest.fn(() => 50) },
      pos: {
        findInRange: jest.fn(() => [builderCreep])
      },
      transfer: jest.fn(() => OK),
      moveTo: jest.fn(() => OK),
      room: {}
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);

    runHaulerRole(creep);

    expect(creep.transfer).toHaveBeenCalledWith(builderCreep, RESOURCE_ENERGY);
  });

  it('should pick up dropped energy when no containers available', () => {
    const droppedEnergy = mockInstanceOf<Resource>({
      resourceType: RESOURCE_ENERGY,
      amount: 100
    });
    
    const source = mockInstanceOf<Source>({
      id: 'source1' as Id<Source>,
      pos: {
        findInRange: jest.fn((type) => {
          if (type === FIND_DROPPED_RESOURCES) return [droppedEnergy];
          if (type === FIND_STRUCTURES) return [];
          return [];
        })
      }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { 
        role: 'hauler', 
        working: false,
        assigned_source: source.id
      },
      store: { getUsedCapacity: jest.fn(() => 0) },
      pos: { 
        isNearTo: jest.fn(() => false),
        findInRange: jest.fn(() => [])
      },
      moveTo: jest.fn(() => OK),
      pickup: jest.fn(() => OK)
    });

    (Game.getObjectById as jest.Mock).mockReturnValue(source);
    HelperFunctions.getGreatestEnergyDrop.mockReturnValue(undefined);

    runHaulerRole(creep);

    expect(creep.pickup).toHaveBeenCalledWith(droppedEnergy);
  });
});
