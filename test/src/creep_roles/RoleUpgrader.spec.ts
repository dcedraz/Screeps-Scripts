import { mockInstanceOf } from 'screeps-jest';
import { RoleUpgrader } from '../../../src/creep_roles/RoleUpgrader';

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

describe('RoleUpgrader', () => {
  it('switches to collect mode and says when out of energy while working', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: () => 10 },
      say: jest.fn(),
      room: {},
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.memory.working).toBe(false);
    expect(creep.say).toHaveBeenCalledWith('🔄 collect');
  });

  it('switches to upgrade mode and says when full while not working', () => {
    const creep = mockInstanceOf<Creep>({
      memory: { working: false },
      store: { [RESOURCE_ENERGY]: 10, getFreeCapacity: () => 0 },
      say: jest.fn(),
      room: { controller: undefined },
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.memory.working).toBe(true);
    expect(creep.say).toHaveBeenCalledWith('⚡ upgrade');
  });

  it('upgrades controller if working and in range', () => {
    const controller = {};
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 10, getFreeCapacity: () => 10 },
      room: { controller },
      upgradeController: jest.fn(() => OK),
      moveTo: jest.fn(),
      say: jest.fn(),
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.upgradeController).toHaveBeenCalledWith(controller);
    expect(creep.moveTo).not.toHaveBeenCalled();
  });

  it('moves to controller if working and not in range', () => {
    const controller = {};
    const creep = mockInstanceOf<Creep>({
      memory: { working: true },
      store: { [RESOURCE_ENERGY]: 10, getFreeCapacity: () => 10 },
      room: { controller },
      upgradeController: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(),
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.upgradeController).toHaveBeenCalledWith(controller);
    expect(creep.moveTo).toHaveBeenCalledWith(controller, expect.anything());
  });

  it('withdraws from first storage target if not working and in range', () => {
    const storage = { store: { getUsedCapacity: () => 10 } };
    HelperFunctions.getRoomStructuresArray.mockReturnValue([storage]);
    HelperFunctions.isStorage.mockReturnValue(true);
    const creep = mockInstanceOf<Creep>({
      memory: { working: false },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: () => 10 },
      room: {},
      withdraw: jest.fn(() => OK),
      moveTo: jest.fn(),
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.withdraw).toHaveBeenCalledWith(storage, RESOURCE_ENERGY);
    expect(creep.moveTo).not.toHaveBeenCalledWith(storage, expect.anything());
  });

  it('moves to storage if not working and not in range', () => {
    const storage = { store: { getUsedCapacity: () => 10 } };
    HelperFunctions.getRoomStructuresArray.mockReturnValue([storage]);
    HelperFunctions.isStorage.mockReturnValue(true);
    const creep = mockInstanceOf<Creep>({
      memory: { working: false },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: () => 10 },
      room: {},
      withdraw: jest.fn(() => ERR_NOT_IN_RANGE),
      moveTo: jest.fn(),
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.withdraw).toHaveBeenCalledWith(storage, RESOURCE_ENERGY);
    expect(creep.moveTo).toHaveBeenCalledWith(storage, expect.anything());
  });

  it('does nothing if not working and no storage targets', () => {
    HelperFunctions.getRoomStructuresArray.mockReturnValue([]);
    const creep = mockInstanceOf<Creep>({
      memory: { working: false },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: () => 10 },
      room: {},
      withdraw: jest.fn(),
      moveTo: jest.fn(),
    });
    const upgrader = new RoleUpgrader(creep);
    upgrader.run();
    expect(creep.withdraw).not.toHaveBeenCalled();
    expect(creep.moveTo).not.toHaveBeenCalled();
  });
});
