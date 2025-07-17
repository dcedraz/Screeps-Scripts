import { mockInstanceOf, mockGlobal } from 'screeps-jest';
import { RoleHarvester } from '../../../src/creep_roles/RoleHarvester';

describe('RoleHarvester', () => {
  it('repairs nearby container if energy > 0', () => {
    const container = { structureType: STRUCTURE_CONTAINER, hits: 10, hitsMax: 100 } as StructureContainer;
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: undefined },
      store: { getUsedCapacity: () => 10 },
      pos: { findInRange: jest.fn(() => [container]), isEqualTo: jest.fn() },
      repair: jest.fn(),
      transfer: jest.fn(),
      harvest: jest.fn(),
      room: { sources: [] },
    });
    const harvester = new RoleHarvester(creep);
    harvester.runInitial();
    expect(creep.pos.findInRange).toHaveBeenCalledWith(FIND_STRUCTURES, 1, expect.anything());
    expect(creep.repair).toHaveBeenCalledWith(container);
  });

  it('gives energy to nearby non-harvester creeps if energy > 0', () => {
    const otherCreep = { memory: { role: 'hauler' } } as Creep;
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: undefined },
      store: { getUsedCapacity: () => 10 },
      pos: { findInRange: jest.fn((type) => type === FIND_MY_CREEPS ? [otherCreep] : []), isEqualTo: jest.fn() },
      transfer: jest.fn(),
      harvest: jest.fn(),
      room: { sources: [] },
    });
    const harvester = new RoleHarvester(creep);
    harvester.runInitial();
    expect(creep.pos.findInRange).toHaveBeenCalledWith(FIND_MY_CREEPS, 1, expect.anything());
    expect(creep.transfer).toHaveBeenCalledWith(otherCreep, RESOURCE_ENERGY);
  });

  it('moves to and harvests assigned source with container', () => {
    const container = { structureType: STRUCTURE_CONTAINER, store: { getFreeCapacity: () => 100 }, hits: 100, hitsMax: 100, pos: { isEqualTo: jest.fn(() => false) } };
    const source = { id: 'source1', pos: { findInRange: jest.fn(() => [container]) } };
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: 'source1' },
      store: { getUsedCapacity: () => 0 },
      pos: { isEqualTo: jest.fn(() => false) },
      moveTo: jest.fn(),
      harvest: jest.fn(() => OK),
      room: { sources: [] },
    });
    mockGlobal<Game>('Game', { getObjectById: jest.fn(() => source) });
    const harvester = new RoleHarvester(creep);
    harvester.runInitial();
    expect(Game.getObjectById).toHaveBeenCalledWith('source1');
    expect(source.pos.findInRange).toHaveBeenCalledWith(FIND_STRUCTURES, 1, expect.anything());
    expect(creep.moveTo).toHaveBeenCalledWith(container);
    expect(creep.harvest).toHaveBeenCalledWith(source);
  });

  it('moves to and harvests assigned source without container', () => {
    const source = { id: 'source1', pos: { findInRange: jest.fn(() => []) } };
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: 'source1' },
      store: { getUsedCapacity: () => 0 },
      pos: { isEqualTo: jest.fn(() => false) },
      moveTo: jest.fn(),
      harvest: jest.fn(() => ERR_NOT_IN_RANGE),
      room: { sources: [] },
    });
    mockGlobal<Game>('Game', { getObjectById: jest.fn(() => source) });
    const harvester = new RoleHarvester(creep);
    harvester.runInitial();
    expect(Game.getObjectById).toHaveBeenCalledWith('source1');
    expect(source.pos.findInRange).toHaveBeenCalledWith(FIND_STRUCTURES, 1, expect.anything());
    expect(creep.harvest).toHaveBeenCalledWith(source);
    expect(creep.moveTo).toHaveBeenCalledWith(source, expect.anything());
  });

  it('harvests from first room source if no assigned_source', () => {
    const source = { id: 'source1' };
    const creep = mockInstanceOf<Creep>({
      memory: { assigned_source: undefined },
      store: { getUsedCapacity: () => 0 },
      moveTo: jest.fn(),
      harvest: jest.fn(() => ERR_NOT_IN_RANGE),
      room: { sources: [source] },
    });
    const harvester = new RoleHarvester(creep);
    harvester.runInitial();
    expect(creep.harvest).toHaveBeenCalledWith(source);
    expect(creep.moveTo).toHaveBeenCalledWith(source, expect.anything());
  });
});
