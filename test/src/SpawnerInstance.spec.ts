import { mockInstanceOf, mockGlobal } from 'screeps-jest';
import { createSpawnerInstance, runSpawner } from '../../src/SpawnerInstance';

jest.mock('../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    findObjectWithID: jest.fn(() => undefined),
  }
}));

const HelperFunctions = require('../../src/utils/HelperFunctions').HelperFunctions;

describe('SpawnerInstance', () => {
  function makeSpawn(overrides = {}) {
    return mockInstanceOf<StructureSpawn>({
      id: 'spawn1',
      spawning: null,
      room: { visual: { text: jest.fn() } },
      pos: { x: 10, y: 20 },
      spawnCreep: jest.fn(() => OK),
      ...overrides,
    });
  }

  function makeOrder(overrides = {}) {
    return {
      name: 'creep1',
      body: [WORK, CARRY, MOVE],
      memory: { role: 'harvester', room: 'W1N1', working: false },
      priority: 1,
      assignedSpawn: undefined,
      ...overrides,
    };
  }

  it('does nothing if spawnQueue is empty', () => {
    const room = mockInstanceOf<Room>({ structures: { spawn: [] } });
    const spawner = createSpawnerInstance(room, []);
    spawner.spawnQueue = [];
    expect(() => runSpawner(spawner)).not.toThrow();
  });

  it('spawns a creep and removes from queue if spawnQueue is not empty and spawnCreep succeeds', () => {
    // Simulate a truthy return value (e.g., 1) for success, per current implementation
    const spawnCreepMock = jest.fn(() => 1);
    const spawn = makeSpawn({ spawnCreep: spawnCreepMock });
    const order = makeOrder({ assignedSpawn: 'spawn1' });
    HelperFunctions.findObjectWithID.mockReturnValue(spawn);
    const room = mockInstanceOf<Room>({ structures: { spawn: [spawn] } });
    const spawner = createSpawnerInstance(room, [spawn], [order]);
    runSpawner(spawner);
    expect(spawnCreepMock).toHaveBeenCalledWith(order.body, order.name, { memory: order.memory });
    expect(spawner.spawnQueue.find((o) => o.name === order.name)).toBeUndefined();
  });

  it('calls spawnVisuals if a spawn is spawning', () => {
    const spawn = makeSpawn({ spawning: { name: 'creep1' } });
    const order = makeOrder({ assignedSpawn: 'spawn1' });
    HelperFunctions.findObjectWithID.mockReturnValue(spawn);
    const room = mockInstanceOf<Room>({ structures: { spawn: [spawn] } });
    const spawner = createSpawnerInstance(room, [spawn], [order]);
    // Mock Game.creeps and memory for spawnVisuals
    mockGlobal('Game', { creeps: { creep1: { memory: { role: 'harvester' } } } });
    runSpawner(spawner);
    expect(spawn.room.visual.text).toHaveBeenCalledWith(
      expect.stringContaining('🛠️'),
      spawn.pos.x + 1,
      spawn.pos.y,
      expect.objectContaining({ align: 'left', opacity: 0.8 })
    );
  });

  it('does not remove from queue if spawnCreep fails', () => {
    // Simulate a falsy return value (e.g., 0) for failure, per current implementation
    const spawnCreepMock = jest.fn(() => 0);
    const spawn = makeSpawn({ spawnCreep: spawnCreepMock });
    const order = makeOrder({ assignedSpawn: 'spawn1' });
    HelperFunctions.findObjectWithID.mockReturnValue(spawn);
    const room = mockInstanceOf<Room>({ structures: { spawn: [spawn] } });
    const spawner = createSpawnerInstance(room, [spawn], [order]);
    runSpawner(spawner);
    expect(spawner.spawnQueue.find((o) => o.name === order.name)).toBeDefined();
  });

  it('spawns creeps in priority order (lowest priority first)', () => {
    const spawnCreepMock = jest.fn(() => 1);
    const spawn = makeSpawn({ spawnCreep: spawnCreepMock });
    const order1 = makeOrder({ assignedSpawn: 'spawn1', name: 'creep1', priority: 2 });
    const order2 = makeOrder({ assignedSpawn: 'spawn1', name: 'creep2', priority: 1 });
    HelperFunctions.findObjectWithID.mockReturnValue(spawn);
    const room = mockInstanceOf<Room>({ structures: { spawn: [spawn] } });
    // Put higher priority order first to test sorting
    const spawner = createSpawnerInstance(room, [spawn], [order1, order2]);
    runSpawner(spawner);
    // The first spawned creep should be the one with lower priority value (order2)
    expect(spawnCreepMock).toHaveBeenCalledWith(order2.body, order2.name, { memory: order2.memory });
    expect(spawner.spawnQueue.find((o) => o.name === order2.name)).toBeUndefined();
    expect(spawner.spawnQueue.find((o) => o.name === order1.name)).toBeDefined();
    // Now run again to spawn the next creep
    runSpawner(spawner);
    expect(spawnCreepMock).toHaveBeenCalledWith(order1.body, order1.name, { memory: order1.memory });
    expect(spawner.spawnQueue.find((o) => o.name === order1.name)).toBeUndefined();
  });
});
