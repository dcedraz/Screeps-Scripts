import { mockInstanceOf } from 'screeps-jest';
import { RoleBuilder } from '../../../src/creep_roles/RoleBuilder';

jest.mock('../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    getRoomStructuresArray: jest.fn(() => []),
    getGreatestEnergyDrop: jest.fn(() => null),
    isStorage: jest.fn(() => false),
    isContainer: jest.fn(() => false),
    isExtension: jest.fn(() => false),
    isSpawn: jest.fn(() => false),
  }
}));

const HelperFunctions = require('../../src/utils/HelperFunctions').HelperFunctions;

describe('RoleBuilder', () => {
  it('switches to collecting when out of energy', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: jest.fn(() => 50) },
      say: jest.fn(),
      room: { name: 'W1N1', cSites: [], controller: undefined },
    });
    const builder = new RoleBuilder(creep, []);
    builder.run();
    expect(creep.memory.working).toBe(false);
    expect(creep.say).toHaveBeenCalledWith('🔄 collect');
  });

  it('switches to building when full', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { working: false },
      store: { [RESOURCE_ENERGY]: 50, getFreeCapacity: jest.fn(() => 0)},
      say: jest.fn(),
      room: { name: 'W1N1', cSites: [], controller: undefined },
    });
    const builder = new RoleBuilder(creep, []);
    builder.run();
    expect(creep.memory.working).toBe(true);
    expect(creep.say).toHaveBeenCalledWith('⚡ build');
  });

  it('calls getEnergy when not working', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { working: false },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: jest.fn(() => 50) },
      room: { name: 'W1N1', cSites: [], controller: undefined },
    });
    const builder = new RoleBuilder(creep, []);
    const getEnergySpy = jest.spyOn(builder, 'getEnergy');
    builder.run();
    expect(getEnergySpy).toHaveBeenCalled();
  });

  it('builds and moves to construction site when working and out of range', () => {
    const site = mockInstanceOf<ConstructionSite>({ id: 'site1' });
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 50, getFreeCapacity: jest.fn(() => 0)},
      room: { name: 'W1N1', cSites: [], controller: undefined },
      moveTo: jest.fn(),
      build: jest.fn(() => ERR_NOT_IN_RANGE),
    });
    const builder = new RoleBuilder(creep, [site]);
    builder.run();
    expect(creep.build).toHaveBeenCalledWith(site);
    expect(creep.moveTo).toHaveBeenCalledWith(site, expect.anything());
  });

  it('repairs and moves to repair site when working and no construction sites but has repair sites', () => {
    const repairSite = { hits: 10, hitsMax: 100 } as Structure;
    HelperFunctions.getRoomStructuresArray.mockReturnValue([repairSite]);
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 50, getFreeCapacity: jest.fn(() => 0)},
      room: { name: 'W1N1', cSites: [], controller: undefined },
      moveTo: jest.fn(),
      repair: jest.fn(() => ERR_NOT_IN_RANGE),
    });
    const builder = new RoleBuilder(creep, []);
    builder.run();
    expect(creep.repair).toHaveBeenCalledWith(repairSite);
    expect(creep.moveTo).toHaveBeenCalledWith(repairSite, expect.anything());
  });

  it('upgrades controller and moves to it when nothing to build or repair', () => {
    const controller = mockInstanceOf<StructureController>({});
    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 50, getFreeCapacity: jest.fn(() => 0) },
      room: { name: 'W1N1', cSites: [], controller },
      moveTo: jest.fn(),
      upgradeController: jest.fn(() => ERR_NOT_IN_RANGE),
    });
    const builder = new RoleBuilder(creep, []);
    builder.run();
    expect(creep.upgradeController).toHaveBeenCalledWith(controller);
    expect(creep.moveTo).toHaveBeenCalledWith(controller, expect.anything());
  });
});