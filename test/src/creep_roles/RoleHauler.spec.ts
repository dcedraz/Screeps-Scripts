import { mockInstanceOf, mockGlobal } from 'screeps-jest';
import { RoleHauler } from '../../../src/creep_roles/RoleHauler';

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

describe('RoleHauler', () => {
  it('gives energy to nearby builder or upgrader creeps when full', () => {
    const targetCreep = { memory: { role: 'builder' } } as Creep;
    const creep = mockInstanceOf<Creep>({
      pos: { findInRange: jest.fn(() => [targetCreep]) },
      transfer: jest.fn(),
      memory: {},
      store: { getUsedCapacity: () => 10 },
      room: {},
    });
    const hauler = new RoleHauler(creep);
    hauler.run();
    expect(creep.pos.findInRange).toHaveBeenCalledWith(FIND_MY_CREEPS, 1, expect.anything());
    expect(creep.transfer).toHaveBeenCalledWith(targetCreep, RESOURCE_ENERGY);
  });

  it('picks up greatest dropped energy if empty and found', () => {
    const dropped = { pos: { isNearTo: jest.fn(() => false) } };
    HelperFunctions.getGreatestEnergyDrop.mockReturnValue(dropped);
    const creep = mockInstanceOf<Creep>({
      room: {},
      pos: { isNearTo: jest.fn(() => false), moveTo: jest.fn() },
      moveTo: jest.fn(),
      pickup: jest.fn(),
      store: { getUsedCapacity: () => 0 },
      memory: { assigned_source: undefined },
    });
    const hauler = new RoleHauler(creep);
    hauler.run();
    expect(HelperFunctions.getGreatestEnergyDrop).toHaveBeenCalledWith(creep.room);
    expect(creep.moveTo).toHaveBeenCalledWith(dropped, expect.anything());
    expect(creep.pickup).toHaveBeenCalledWith(dropped);
  });

  it('gets energy from dropped energy at assigned source if present', () => {
    const dropped = { pos: { isNearTo: jest.fn(() => false) } };
    const source = { pos: { findInRange: jest.fn((type) => type === FIND_DROPPED_RESOURCES ? [dropped] : []) } };
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: 'source1' },
      pos: { isNearTo: jest.fn(() => false), moveTo: jest.fn() },
      moveTo: jest.fn(),
      pickup: jest.fn(),
      room: {},
      store: { getUsedCapacity: () => 0 },
    });
    mockGlobal<Game>('Game', { getObjectById: jest.fn(() => source) });
    const hauler = new RoleHauler(creep);
    hauler.run();
    expect(Game.getObjectById).toHaveBeenCalledWith('source1');
    expect(source.pos.findInRange).toHaveBeenCalledWith(FIND_DROPPED_RESOURCES, 1);
    expect(creep.moveTo).toHaveBeenCalledWith(dropped, expect.anything());
    expect(creep.pickup).toHaveBeenCalledWith(dropped);
  });

  it('gets energy from source container if no dropped energy at source', () => {
    const container = { pos: { isNearTo: jest.fn(() => false) }, store: { getUsedCapacity: () => 50 } };
    const source = { pos: { findInRange: jest.fn((type) => type === FIND_STRUCTURES ? [container] : []) } };
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: 'source1' },
      pos: { isNearTo: jest.fn(() => false), moveTo: jest.fn() },
      moveTo: jest.fn(),
      withdraw: jest.fn(),
      room: {},
      store: { getUsedCapacity: () => 0 },
    });
    mockGlobal<Game>('Game', { getObjectById: jest.fn(() => source) });
    const hauler = new RoleHauler(creep);
    hauler.run();
    expect(Game.getObjectById).toHaveBeenCalledWith('source1');
    expect(source.pos.findInRange).toHaveBeenCalledWith(FIND_DROPPED_RESOURCES, 1);
    expect(source.pos.findInRange).toHaveBeenCalledWith(FIND_STRUCTURES, 1, expect.anything());
    expect(creep.moveTo).toHaveBeenCalledWith(container, expect.anything());
    expect(creep.withdraw).toHaveBeenCalledWith(container, RESOURCE_ENERGY);
  });

  it('stores energy in sorted storage targets when full and no nearby creeps', () => {
    const target = { pos: { isNearTo: jest.fn(() => false) }, store: { getFreeCapacity: () => 100 } };
    HelperFunctions.getRoomStructuresArray.mockReturnValue([target]);
    HelperFunctions.isSpawn.mockReturnValue(true);
    const creep = mockInstanceOf<Creep>({
      pos: { 
        isNearTo: jest.fn(() => false), 
        moveTo: jest.fn(),
        findInRange: jest.fn((type: any) => type === FIND_MY_CREEPS ? [] : [target])
      },
      moveTo: jest.fn(),
      transfer: jest.fn(),
      store: { getUsedCapacity: () => 10 },
      room: {},
      memory: {},
    });
    const hauler = new RoleHauler(creep);
    hauler.run();
    expect(creep.moveTo).toHaveBeenCalledWith(target, expect.anything());
    expect(creep.transfer).toHaveBeenCalledWith(target, RESOURCE_ENERGY);
  });
});
