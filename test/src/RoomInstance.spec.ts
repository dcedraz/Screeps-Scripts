import { mockGlobal, mockInstanceOf } from 'screeps-jest';
import { RoomInstance } from '../../src/RoomInstance';
import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { StructuresInstance } from "StructuresInstance";

function createInstance({
  controller = mockInstanceOf<StructureController>({
    level: 2,
    safeMode: undefined,
    safeModeCooldown: undefined,
    activateSafeMode: jest.fn(),
  }),
  spawner = mockInstanceOf<SpawnerInstance>({
    spawnQueueAdd: jest.fn(),
    run: jest.fn(),
  }),
  creeps = mockInstanceOf<CreepsInstance>({
    harvesters: [] as Creep[],
    haulers: [] as Creep[],
    upgraders: [] as Creep[],
    builders: [] as Creep[],
    MyCreepBodies: {
      harvesters: ['work', 'move'],
      haulers: ['carry', 'move'],
      upgraders: ['work', 'carry', 'move'],
      builders: ['work', 'carry', 'move'],
    },
    newCreep: jest.fn(() => ({})),
    run: jest.fn(),
  }),
  sources = [
    mockInstanceOf<Source>({ id: 'source1' }),
    mockInstanceOf<Source>({ id: 'source2' })
  ],
  structures = mockInstanceOf<StructuresInstance>({}),
} = {}) {
  const room = mockInstanceOf<Room>({ controller, sources, find: jest.fn(() => []) });
  return { instance: new RoomInstance(room, controller, spawner, sources, structures, creeps), controller, spawner, creeps, sources };
}

describe('RoomInstance', () => {
  it('activates safe mode if conditions are met', () => {
    const { instance, controller } = createInstance();
    instance.run();
    expect(controller.activateSafeMode).toHaveBeenCalled();
  });

  it('spawns a harvester if less than sources', () => {
    const { instance, creeps, spawner } = createInstance();
    creeps.harvesters = [];
    instance.run();
    expect(spawner.spawnQueueAdd).toHaveBeenCalled();
    expect(creeps.newCreep).toHaveBeenCalledWith('harvester', expect.anything(), expect.anything(), expect.anything());
  });

  it('spawns a hauler if less than harvesters', () => {
    const { instance, creeps, spawner } = createInstance();
    creeps.harvesters = [
      mockInstanceOf<Creep>({ memory: { assigned_source: 'source1' } }),
      mockInstanceOf<Creep>({ memory: { assigned_source: 'source2' } })
    ];
    creeps.haulers = [
      mockInstanceOf<Creep>({ memory: { assigned_source: 'source1' } })
    ];
    instance.run();
    expect(spawner.spawnQueueAdd).toHaveBeenCalled();
    expect(creeps.newCreep).toHaveBeenCalledWith('hauler', expect.anything(), expect.anything(), expect.anything());
  });

  it('spawns an upgrader if less than 3', () => {
    const { instance, creeps, spawner } = createInstance();
    creeps.upgraders = [];
    instance.run();
    expect(spawner.spawnQueueAdd).toHaveBeenCalled();
    expect(creeps.newCreep).toHaveBeenCalledWith('upgrader', expect.anything(), expect.anything());
  });

  it('spawns a builder if less than 1 and controller level > 1', () => {
    const { instance, creeps, spawner, controller } = createInstance();
    creeps.builders = [];
    controller.level = 2;
    instance.run();
    expect(spawner.spawnQueueAdd).toHaveBeenCalled();
    expect(creeps.newCreep).toHaveBeenCalledWith('builder', expect.anything(), expect.anything());
  });

  it('runs creeps and spawner logic', () => {
    const { instance, creeps, spawner } = createInstance();
    instance.run();
    expect(creeps.run).toHaveBeenCalled();
    expect(spawner.run).toHaveBeenCalled();
  });
});
