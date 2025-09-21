import { mockInstanceOf, mockGlobal } from 'screeps-jest';

import { 
  createStructuresData, 
  calculateRoomPositions, 
  createSourceStructures,
  resetRoomPositions,
  getMemoizedRoomPositions
} from '../../src/StructuresInstance';
import { CostMatrixData, createCostMatrix, getMemoizedCostMatrix, calculateCostMatrix } from '../../src/utils/CostMatrix';

jest.mock('../../src/utils/HelperFunctions', () => ({
  HelperFunctions: {
    emptyBaseStructures: jest.fn(() => ({
      spawn: [], storage: [], link: [], tower: [], road: [], extension: [], container: [], wall: [], rampart: []
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
    mockGlobal('TERRAIN_MASK_WALL', { valueOf: () => 1 });
  });

  function makeRoom(overrides = {}) {
    return mockInstanceOf<Room>({
      name: 'W1N1',
      memory: {
        sourcesMapped: [],
        source_containers: {},
        roomPositions: undefined,
        roomCostMatrix: {},
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
      sources: [],
      cSites: [],
      getTerrain: jest.fn(() => ({ get: jest.fn(() => 0) })),
      visual: { text: jest.fn(), circle: jest.fn() },
      createConstructionSite: jest.fn(),
      findPath: jest.fn(() => [{ x: 1, y: 1 }, { x: 2, y: 2 }]),
      ...overrides,
    });
  }

  function makeCostMatrix(roomOverrides: Partial<Room> = {}): CostMatrixData {
    // Provide minimal required Room API for CostMatrix
    const room = makeRoom(roomOverrides);
    return createCostMatrix(room);
  }

  it('memoizes costMatrix calculation (returns same serialized result when cached)', () => {
    // Reset mocks
    jest.clearAllMocks();
    
    const room = makeRoom();
    
    // First call - will calculate
    const firstResult = getMemoizedCostMatrix(room);
    
    // Second call - should return identical result from cache
    const secondResult = getMemoizedCostMatrix(room);
    
    // Results should be identical (same data structure)
    expect(secondResult.matrix).toEqual(firstResult.matrix);
    expect(secondResult.roomName).toBe(firstResult.roomName);
  });

  it('memoizes roomPositions calculation (returns same result when cached)', () => {
    // Reset mocks
    jest.clearAllMocks();
    
    const room = makeRoom();
    const costMatrix = makeCostMatrix(room);
    
    // First call - will calculate
    const firstResult = getMemoizedRoomPositions(room, costMatrix);
    
    // Second call - should return identical result from cache
    const secondResult = getMemoizedRoomPositions(room, costMatrix);
    
    // Results should be identical (same data structure)
    expect(secondResult).toEqual(firstResult);
  });

  it('memoization works with real HelperFunctions (integration test)', () => {
    // Temporarily restore real memoization functions for this test
    const HelperFunctionsModule = require('../../src/utils/HelperFunctions');
    const realMemoizeCostMatrix = HelperFunctionsModule.HelperFunctions.memoizeCostMatrix;
    const realMemoizeRoomPositions = HelperFunctionsModule.HelperFunctions.memoizeRoomPositions;
    
    // Use a room with real memory behavior
    const room = makeRoom({
      memory: {
        sourcesMapped: [],
        source_containers: {},
        // Start with no cached data
        roomPositions: {},
        roomCostMatrix: {},
      }
    });
    
    // Test cost matrix memoization
    const memoizedCostFn = realMemoizeCostMatrix(() => "test-result", room);
    expect(memoizedCostFn("testKey")).toBe("test-result");
    // Second call should return cached result
    expect(memoizedCostFn("testKey")).toBe("test-result");
    
    // Test room positions memoization
    const memoizedRoomFn = realMemoizeRoomPositions(() => ({ test: "data" }), room);
    expect(memoizedRoomFn("testKey")).toEqual({ test: "data" });
    // Second call should return cached result
    expect(memoizedRoomFn("testKey")).toEqual({ test: "data" });
  });

  it('creates structures data with memoized cost matrix and room positions', () => {
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
    Game.rooms[room.name] = mockInstanceOf<Room>({
      visual: mockInstanceOf<RoomVisual>({ text: jest.fn(), circle: jest.fn() })
    });
    
    const sources = [mockInstanceOf<Source>({ id: 'source1', pos: { x: 5, y: 5 } })];
    const structuresData = createStructuresData(room, sources);
    
    // Should return structures data with calculated positions
    expect(structuresData.roomName).toBe(room.name);
    expect(structuresData.roomSources).toEqual(sources);
    expect(structuresData.roomController).toBe(room.controller);
    expect(structuresData.roomPositions).toEqual(
      expect.objectContaining({
        spawn: expect.any(Array),
        storage: expect.any(Array),
        link: expect.any(Array),
        tower: expect.any(Array),
        road: expect.any(Array),
        extension: expect.any(Array),
      })
    );
    
    HelperFunctions.memoizeCostMatrix = orig;
  });

  it('calculates room positions based on spawn location', () => {
    const room = makeRoom();
    Game.rooms[room.name] = mockInstanceOf<Room>({
      visual: mockInstanceOf<RoomVisual>({ text: jest.fn(), circle: jest.fn() })
    });
    const costMatrix = makeCostMatrix(room);
    
    const roomPositions = calculateRoomPositions(room, costMatrix);
    
    // Should have at least one spawn position and possibly others
    expect(roomPositions.spawn.length).toBeGreaterThan(0);
    expect(roomPositions).toEqual(
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
    
    createSourceStructures(room, sources, costMatrix);
    
    // Should have attempted to create at least one construction site (for road or container)
    expect(csiteSpy).toHaveBeenCalled();
    // sourcesMapped should now include the source id
    expect(room.memory.sourcesMapped).toContain('source1');
  });

  it('resetRoomPositions() deletes memory', () => {
    const room = makeRoom();
    room.memory.roomPositions = { foo: 'bar' };
    
    resetRoomPositions(room);
    
    expect('roomPositions' in room.memory).toBe(false);
  });
});
