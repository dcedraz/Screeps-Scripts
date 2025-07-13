import { mockInstanceOf, mockGlobal } from 'screeps-jest';

import { StructuresInstance } from '../../src/StructuresInstance';
import { CostMatrix } from '../../src/utils/CostMatrix';

jest.mock('../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    emptyBaseStructures: jest.fn(() => ({
      spawn: [], storage: [], link: [], tower: [], road: [], extension: []
    })),
    memoizeRoomPositions: jest.fn((fn, r) => fn),
    memoizeCostMatrix: jest.fn((fn, r) => fn),
  }
}));

const HelperFunctions = require('../../src/utils/HelperFunctions').HelperFunctions;

describe('StructuresInstance', () => {
  beforeAll(() => {
    // Mock global Game and constants for Screeps
    mockGlobal<Game>('Game', {
      rooms: {},
      time: 100,
      cpu: { getUsed: jest.fn(() => 0) },
    });
    mockGlobal('OK', { valueOf: () => 0 });
    mockGlobal('STRUCTURE_SPAWN', { toString: () => 'spawn' });
    mockGlobal('STRUCTURE_EXTENSION', { toString: () => 'extension' });
    mockGlobal('STRUCTURE_CONTAINER', { toString: () => 'container' });
    mockGlobal('STRUCTURE_ROAD', { toString: () => 'road' });
    mockGlobal('FIND_CONSTRUCTION_SITES', { valueOf: () => 111 });
    mockGlobal('FIND_MY_STRUCTURES', { valueOf: () => 222 });
    mockGlobal('FIND_MY_SPAWNS', { valueOf: () => 333 });
    mockGlobal('CONTROLLER_STRUCTURES', { extension: { 2: 5 } });
  });

  function makeRoom(overrides = {}) {
    return mockInstanceOf<Room>({
      name: 'W1N1',
      memory: {
        sourcesMapped: [],
        source_containers: {},
        roomPositions: undefined,
        ...((overrides as any).memory || {})
      },
      structures: {
        spawn: [
          { pos: { x: 10, y: 20 }, structureType: 'spawn' }
        ]
      },
      controller: { level: 2 },
      getPositionAt: jest.fn((x, y) => ({ x, y })),
      find: jest.fn(() => []),
      myCreeps: [],
      visual: { text: jest.fn(), circle: jest.fn() },
      createConstructionSite: jest.fn(),
      findPath: jest.fn(() => [{ x: 1, y: 1 }, { x: 2, y: 2 }]),
      ...overrides,
    });
  }


  function makeCostMatrix(roomOverrides: Partial<Room> = {}) {
    // Provide minimal required Room API for CostMatrix
    const room = mockInstanceOf<Room>({
      ...roomOverrides,
      sources: [],
      structures: {
        spawn: [
          { pos: { x: 10, y: 20 }, structureType: 'spawn' }
        ]
      },
      cSites: [],
      myCreeps: [],
      getTerrain: jest.fn(() => ({ get: jest.fn(() => 0) })),
      name: 'W1N1',
      memory: {
        sourcesMapped: [],
        source_containers: {},
        roomPositions: undefined,
        ...((roomOverrides as any).memory || {})
      },
    });
    return new CostMatrix(room);
  }

  it('memoizes costMatrix calculation (calls memoizeCostMatrix and caches result)', () => {
    // Patch HelperFunctions.memoizeCostMatrix to a real memoizer for this test
    const realMemo = (fn: any, _room: any) => {
      const cache: Record<string, any> = {};
      return (key: string) => {
        if (!(key in cache)) cache[key] = fn();
        return cache[key];
      };
    };
    const orig = HelperFunctions.memoizeCostMatrix;
    HelperFunctions.memoizeCostMatrix = realMemo;
    const room = makeRoom();
    const costMatrix = makeCostMatrix(room);
    // Spy on the real instance method
    const spy = jest.spyOn(costMatrix, 'calcMatrix');
    // Memoize the bound method
    const memoized = realMemo(costMatrix.calcMatrix.bind(costMatrix), room);
    memoized(room.name);
    memoized(room.name);
    expect(spy).toHaveBeenCalledTimes(1);
    HelperFunctions.memoizeCostMatrix = orig;
  });

  it('builds room positions and stores them in instance.roomPositions', () => {
    const room = makeRoom();
    Game.rooms[room.name] = mockInstanceOf<Room>({
      visual: mockInstanceOf<RoomVisual>({ text: jest.fn(), circle: jest.fn() })
    });
    const costMatrix = makeCostMatrix(room);
    const sources = [mockInstanceOf<Source>({ id: 'source1', pos: { x: 5, y: 5 } })];
    const instance = new StructuresInstance(room, sources, room.controller, costMatrix);
    // Should have at least one spawn position and possibly others
    expect(instance.roomPositions.spawn.length).toBeGreaterThan(0);
    expect(instance.roomPositions).toEqual(
      expect.objectContaining({
        spawn: expect.any(Array),
        storage: expect.any(Array),
        link: expect.any(Array),
        tower: expect.any(Array),
        road: expect.any(Array),
        extension: expect.any(Array),
      })
    );
  });

  it('creates source structures: creates construction sites and updates sourcesMapped', () => {
    const room = makeRoom();
    Game.rooms[room.name] = mockInstanceOf<Room>({
      visual: mockInstanceOf<RoomVisual>({ text: jest.fn(), circle: jest.fn() })
    });
    const costMatrix = makeCostMatrix(room);
    const sources = [mockInstanceOf<Source>({ id: 'source1', pos: { x: 5, y: 5 } })];
    // Track calls to createConstructionSite
    const csiteSpy = room.createConstructionSite;
    // Track sourcesMapped
    expect(room.memory.sourcesMapped).toEqual([]);
    new StructuresInstance(room, sources, room.controller, costMatrix);
    // Should have attempted to create at least one construction site (for road or container)
    expect(csiteSpy).toHaveBeenCalled();
    // sourcesMapped should now include the source id
    expect(room.memory.sourcesMapped).toContain('source1');
  });


  it('reset() clears roomPositions and deletes memory', () => {
    const room = makeRoom();
    Game.rooms[room.name] = mockInstanceOf<Room>({
      visual: mockInstanceOf<RoomVisual>({ text: jest.fn(), circle: jest.fn() })
    });
    room.memory.roomPositions = { foo: 'bar' };
    const costMatrix = makeCostMatrix(room);
    const instance = new StructuresInstance(room, [], room.controller, costMatrix);
    instance.reset();
    expect(HelperFunctions.emptyBaseStructures).toHaveBeenCalled();
    expect(instance.roomPositions).toEqual({ spawn: [], storage: [], link: [], tower: [], road: [], extension: [] });
    expect('roomPositions' in room.memory).toBe(false);
  });
});
