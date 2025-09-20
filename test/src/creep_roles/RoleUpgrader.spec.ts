import { mockInstanceOf, mockGlobal } from 'screeps-jest';

// Mock Screeps globals before importing user code
mockGlobal<Game>('Game', {
  time: 12345,
  getObjectById: jest.fn(),
});

import { runUpgraderRole } from '../../../src/creep_roles/RoleUpgrader';

jest.mock('../../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    getRoomStructuresArray: jest.fn(() => []),
    isExtension: jest.fn(() => false),
    isStorage: jest.fn(() => false),
    isContainer: jest.fn(() => false),
    isSpawn: jest.fn(() => false),
  }
}));

const HelperFunctions = require('../../../src/utils/HelperFunctions').HelperFunctions;

// Functional approach tests
describe('runUpgraderRole (Functional)', () => {
  it('should upgrade room controller when has energy', () => {
    const controller = mockInstanceOf<StructureController>({});
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'upgrader', working: true },
      store: { 
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: jest.fn(() => 50),
        getFreeCapacity: jest.fn(() => 0) 
      },
      upgradeController: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      say: jest.fn(),
      room: { controller }
    });

    runUpgraderRole(creep);

    expect(creep.upgradeController).toHaveBeenCalledWith(controller);
    expect(creep.moveTo).toHaveBeenCalledWith(controller, expect.anything());
  });

  it('should collect energy from storage when empty', () => {
    const storage = mockInstanceOf<StructureStorage>({
      structureType: STRUCTURE_STORAGE,
      store: { getUsedCapacity: jest.fn(() => 500) }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'upgrader', working: false },
      store: { 
        [RESOURCE_ENERGY]: 0,
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50) 
      },
      withdraw: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      say: jest.fn(),
      room: {}
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([storage]);
    HelperFunctions.isStorage.mockReturnValue(true);
    HelperFunctions.isContainer.mockReturnValue(false);
    HelperFunctions.isExtension.mockReturnValue(false);
    HelperFunctions.isSpawn.mockReturnValue(false);

    runUpgraderRole(creep);

    expect(creep.withdraw).toHaveBeenCalledWith(storage, RESOURCE_ENERGY);
    expect(creep.moveTo).toHaveBeenCalledWith(storage, expect.anything());
  });

  it('should switch to working state when full', () => {
    const controller = mockInstanceOf<StructureController>({});
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'upgrader', working: false },
      store: { 
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: jest.fn(() => 50),
        getFreeCapacity: jest.fn(() => 0) 
      },
      upgradeController: jest.fn(() => OK),
      say: jest.fn(),
      room: { controller }
    });

    runUpgraderRole(creep);

    expect(creep.memory.working).toBe(true);
    expect(creep.say).toHaveBeenCalledWith("⚡ upgrade");
  });

  it('should switch to collecting state when empty', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'upgrader', working: true },
      store: { 
        [RESOURCE_ENERGY]: 0,
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50) 
      },
      say: jest.fn(),
      room: {}
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);

    runUpgraderRole(creep);

    expect(creep.memory.working).toBe(false);
    expect(creep.say).toHaveBeenCalledWith("🔄 collect");
  });

  it('should prefer containers over spawns for energy collection', () => {
    const container = mockInstanceOf<StructureContainer>({
      structureType: STRUCTURE_CONTAINER,
      store: { getUsedCapacity: jest.fn(() => 300) }
    });
    
    const spawn = mockInstanceOf<StructureSpawn>({
      structureType: STRUCTURE_SPAWN,
      store: { getUsedCapacity: jest.fn(() => 200) }
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'upgrader', working: false },
      store: { 
        [RESOURCE_ENERGY]: 0,
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50) 
      },
      withdraw: jest.fn(() => OK),
      say: jest.fn(),
      room: {}
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([spawn, container]);
    HelperFunctions.isStorage.mockReturnValue(false);
    HelperFunctions.isContainer.mockImplementation((s: any) => s === container);
    HelperFunctions.isExtension.mockReturnValue(false);
    HelperFunctions.isSpawn.mockImplementation((s: any) => s === spawn);

    runUpgraderRole(creep);

    expect(creep.withdraw).toHaveBeenCalledWith(container, RESOURCE_ENERGY);
  });
});
