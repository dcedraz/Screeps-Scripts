import { mockInstanceOf, mockGlobal } from 'screeps-jest';

// Mock Screeps globals before importing user code
mockGlobal<Game>('Game', {
  time: 12345,
  getObjectById: jest.fn(),
});

import { runBuilderRole } from '../../../src/creep_roles/RoleBuilder';

jest.mock('../../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    getRoomStructuresArray: jest.fn(() => []),
    getGreatestEnergyDrop: jest.fn(() => null),
    isStorage: jest.fn(() => false),
    isContainer: jest.fn(() => false),
    isExtension: jest.fn(() => false),
    isSpawn: jest.fn(() => false),
  }
}));

const HelperFunctions = require('../../../src/utils/HelperFunctions').HelperFunctions;

// Functional approach tests
describe('runBuilderRole (Functional)', () => {
  it('should build construction sites when has energy', () => {
    const constructionSite = mockInstanceOf<ConstructionSite>({});
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: true },
      store: { 
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: jest.fn(() => 50),
        getFreeCapacity: jest.fn(() => 0) 
      },
      build: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      say: jest.fn(),
      room: {
        cSites: [constructionSite]
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);

    runBuilderRole(creep);

    expect(creep.build).toHaveBeenCalledWith(constructionSite);
    expect(creep.moveTo).toHaveBeenCalledWith(constructionSite, expect.anything());
  });

  it('should collect energy from storage when empty', () => {
    const storage = mockInstanceOf<StructureStorage>({
      structureType: STRUCTURE_STORAGE,
      store: { [RESOURCE_ENERGY]: 500 },
      hits: 1000,
      hitsMax: 1000
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: false },
      store: { 
        [RESOURCE_ENERGY]: 0,
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50) 
      },
      withdraw: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      say: jest.fn(),
      room: {
        cSites: []
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([storage]);
    HelperFunctions.isStorage.mockReturnValue(true);
    HelperFunctions.isContainer.mockReturnValue(false);
    HelperFunctions.isExtension.mockReturnValue(false);
    HelperFunctions.isSpawn.mockReturnValue(false);
    HelperFunctions.getGreatestEnergyDrop.mockReturnValue(undefined);

    runBuilderRole(creep);

    expect(creep.withdraw).toHaveBeenCalledWith(storage, RESOURCE_ENERGY);
    expect(creep.moveTo).toHaveBeenCalledWith(storage, expect.anything());
  });

  it('should repair damaged structures when no construction sites', () => {
    const damagedStructure = mockInstanceOf<StructureRoad>({
      hits: 500,
      hitsMax: 1000,
      structureType: STRUCTURE_ROAD
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: true },
      store: { 
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: jest.fn(() => 50),
        getFreeCapacity: jest.fn(() => 0) 
      },
      repair: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      say: jest.fn(),
      room: {
        cSites: []
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([damagedStructure]);

    runBuilderRole(creep);

    expect(creep.repair).toHaveBeenCalledWith(damagedStructure);
    expect(creep.moveTo).toHaveBeenCalledWith(damagedStructure, expect.anything());
  });

  it('should upgrade controller when no construction sites and no repairs needed', () => {
    const controller = mockInstanceOf<StructureController>({});
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: true },
      store: { 
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: jest.fn(() => 50),
        getFreeCapacity: jest.fn(() => 0) 
      },
      upgradeController: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(() => OK),
      say: jest.fn(),
      room: {
        cSites: [],
        controller
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);

    runBuilderRole(creep);

    expect(creep.upgradeController).toHaveBeenCalledWith(controller);
    expect(creep.moveTo).toHaveBeenCalledWith(controller, expect.anything());
  });

  it('should switch to working state when full', () => {
    const constructionSite = mockInstanceOf<ConstructionSite>({});
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: false },
      store: { 
        [RESOURCE_ENERGY]: 50,
        getUsedCapacity: jest.fn(() => 50),
        getFreeCapacity: jest.fn(() => 0) 
      },
      build: jest.fn(() => OK),
      say: jest.fn(),
      room: {
        cSites: [constructionSite]
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);

    runBuilderRole(creep);

    expect(creep.memory.working).toBe(true);
    expect(creep.say).toHaveBeenCalledWith("⚡ build");
  });

  it('should switch to collecting state when empty', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: true },
      store: { 
        [RESOURCE_ENERGY]: 0,
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50) 
      },
      say: jest.fn(),
      room: {
        cSites: []
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);
    HelperFunctions.getGreatestEnergyDrop.mockReturnValue(undefined);

    runBuilderRole(creep);

    expect(creep.memory.working).toBe(false);
    expect(creep.say).toHaveBeenCalledWith("🔄 collect");
  });

  it('should pick up dropped energy when no storage available', () => {
    const droppedEnergy = mockInstanceOf<Resource>({
      resourceType: RESOURCE_ENERGY,
      amount: 100
    });
    
    const creep = mockInstanceOf<Creep>({
      memory: { role: 'builder', working: false },
      store: { 
        [RESOURCE_ENERGY]: 0,
        getUsedCapacity: jest.fn(() => 0),
        getFreeCapacity: jest.fn(() => 50) 
      },
      pickup: jest.fn(() => OK),
      moveTo: jest.fn(() => OK),
      pos: {
        isNearTo: jest.fn(() => false)
      },
      say: jest.fn(),
      room: {
        cSites: []
      }
    });

    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);
    HelperFunctions.getGreatestEnergyDrop.mockReturnValue(droppedEnergy);

    runBuilderRole(creep);

    expect(creep.moveTo).toHaveBeenCalledWith(droppedEnergy, expect.anything());
  });
});