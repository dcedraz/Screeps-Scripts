import { mockInstanceOf, mockGlobal } from 'screeps-jest';

import { 
  calculateRoadsAroundStructures,
  checkPosOnMatrix,
  createConstructionSite,
  shouldBuildStructures,
  memoizeRoomPositions,
  resetRoomPositions
} from '../../src/StructuresInstance';
import { CostMatrixData } from '../../src/utils/CostMatrix';

describe('StructuresInstance - Clean Tests', () => {
  
  beforeAll(() => {
    // Mock Screeps globals
    mockGlobal<Game>('Game', {
      rooms: {},
      time: 12345,
      cpu: { limit: 20, tickLimit: 500, bucket: 10000 } as any,
      spawns: {},
      creeps: {},
      powerCreeps: {},
      flags: {},
      gcl: { level: 1, progress: 0, progressTotal: 1000000 } as any,
      gpl: { level: 1, progress: 0, progressTotal: 1000000 } as any,
      map: {} as any,
      market: {} as any,
      resources: {} as any,
      shard: { name: 'shard3', type: 'normal', ptr: false }
    });

    mockGlobal<typeof Memory>('Memory', {
      creeps: {},
      rooms: {},
      spawns: {},
      flags: {}
    });

    // Mock Screeps constants
    (global as any).OK = 0;
    (global as any).STRUCTURE_ROAD = 'road';
    (global as any).STRUCTURE_SPAWN = 'spawn';
    (global as any).STRUCTURE_EXTENSION = 'extension';
  });

  // Helper function to create a simple room mock
  function createTestRoom(): Room {
    return mockInstanceOf<Room>({
      name: 'W1N1',
      memory: { roomPositions: {} },
      getPositionAt: jest.fn((x: number, y: number) => 
        mockInstanceOf<RoomPosition>({ x, y, roomName: 'W1N1' })
      ),
      createConstructionSite: jest.fn(() => 0) // Return OK
    });
  }

  // Helper function to create a simple cost matrix mock
function createTestCostMatrix(room: Room): CostMatrixData {
  // Create a proper cost matrix with the expected structure
  const matrix = new Array(2500).fill(0); // 50x50 grid
  return {
    roomName: room.name,
    matrix: matrix
  };
}  describe('checkPosOnMatrix', () => {
    it('should return valid position when getCost returns non-255', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      // Mock the getCost function directly
      const getCostSpy = jest.spyOn(require('../../src/utils/CostMatrix'), 'getCost');
      getCostSpy.mockReturnValue(0); // Valid position
      
      const result = checkPosOnMatrix(costMatrix, room, 10, 10);
      
      expect(result).toBeTruthy();
      expect(getCostSpy).toHaveBeenCalledWith(costMatrix, 10, 10);
      
      getCostSpy.mockRestore();
    });

    it('should return null when getCost returns 255 (blocked)', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      const getCostSpy = jest.spyOn(require('../../src/utils/CostMatrix'), 'getCost');
      getCostSpy.mockReturnValue(255); // Blocked position
      
      const result = checkPosOnMatrix(costMatrix, room, 10, 10);
      
      expect(result).toBeNull();
      expect(getCostSpy).toHaveBeenCalledWith(costMatrix, 10, 10);
      
      getCostSpy.mockRestore();
    });
  });

  describe('calculateRoadsAroundStructures', () => {
    it('should generate roads at correct positions', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      // Mock getCost to always return valid (0)
      const getCostSpy = jest.spyOn(require('../../src/utils/CostMatrix'), 'getCost');
      getCostSpy.mockReturnValue(0);
      
      const structures: StructPos[] = [
        { x: 25, y: 25, built: false }
      ];
      
      const roads = calculateRoadsAroundStructures(structures, costMatrix, room);
      
      // Should generate 8 roads total (4 at distance 1, 4 at distance 2)
      expect(roads.length).toBe(8);
      
      // Verify positions are correct
      const expectedPositions = [
        // Distance 1
        { x: 26, y: 25 }, { x: 24, y: 25 }, { x: 25, y: 26 }, { x: 25, y: 24 },
        // Distance 2
        { x: 27, y: 25 }, { x: 23, y: 25 }, { x: 25, y: 27 }, { x: 25, y: 23 }
      ];
      
      expectedPositions.forEach(expected => {
        const found = roads.find(road => road.x === expected.x && road.y === expected.y);
        expect(found).toBeDefined();
        expect(found?.built).toBe(false);
      });
      
      getCostSpy.mockRestore();
    });

    it('CRITICAL TEST: should validate positions using checkPosOnMatrix', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      // Mock getCost to simulate blocked positions
      const getCostSpy = jest.spyOn(require('../../src/utils/CostMatrix'), 'getCost');
      getCostSpy.mockImplementation((...args: unknown[]) => {
        const [matrix, x, y] = args as [any, number, number];
        // Block distance-1 positions around (25,25) by returning 255
        if ((x === 26 && y === 25) || (x === 24 && y === 25) || 
            (x === 25 && y === 26) || (x === 25 && y === 24)) {
          return 255; // blocked
        }
        return 0; // valid
      });
      
      const structures: StructPos[] = [
        { x: 25, y: 25, built: false }
      ];
      
      const roads = calculateRoadsAroundStructures(structures, costMatrix, room);
      
      // Validation is working: should only have 4 roads (distance-2 positions)
      expect(roads.length).toBe(4);
      
      // Verify only distance-2 roads are present
      roads.forEach(road => {
        const distance = Math.abs(road.x - 25) + Math.abs(road.y - 25);
        expect(distance).toBe(2);
      });
      
      // Verify expected positions
      const expectedPositions = [
        { x: 27, y: 25 }, { x: 23, y: 25 }, { x: 25, y: 27 }, { x: 25, y: 23 }
      ];
      expectedPositions.forEach(expected => {
        const found = roads.find(road => road.x === expected.x && road.y === expected.y);
        expect(found).toBeDefined();
        expect(found?.built).toBe(false);
      });
      
      // Verify getCost was called for validation
      expect(getCostSpy).toHaveBeenCalledTimes(8); // Should check all 8 positions
      
      getCostSpy.mockRestore();
    });

    it('should handle empty structures array', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      const roads = calculateRoadsAroundStructures([], costMatrix, room);
      
      expect(roads).toEqual([]);
    });
  });

  describe('createConstructionSite', () => {
    it('should create site when position is valid', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      const getCostSpy = jest.spyOn(require('../../src/utils/CostMatrix'), 'getCost');
      getCostSpy.mockReturnValue(0); // Valid position
      
      const result = createConstructionSite(room, costMatrix, 10, 10, STRUCTURE_ROAD);
      
      expect(result).toBe(true);
      expect(room.createConstructionSite).toHaveBeenCalledWith(10, 10, STRUCTURE_ROAD);
      
      getCostSpy.mockRestore();
    });

    it('should not create site when position is blocked', () => {
      const room = createTestRoom();
      const costMatrix = createTestCostMatrix(room);
      
      const getCostSpy = jest.spyOn(require('../../src/utils/CostMatrix'), 'getCost');
      getCostSpy.mockReturnValue(255); // Blocked position
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = createConstructionSite(room, costMatrix, 10, 10, STRUCTURE_ROAD);
      
      expect(result).toBe(false);
      expect(room.createConstructionSite).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('CostMatrix error: failed to build road at 10,10');
      
      getCostSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('shouldBuildStructures', () => {
    it('should return true when structures need building', () => {
      const roomPositions: BaseStructures = {
        spawn: [{ x: 25, y: 25, built: true }],
        storage: [{ x: 22, y: 22, built: false }], // Needs building
        link: [], tower: [], road: [], extension: [], container: [], wall: [], rampart: []
      };
      
      const result = shouldBuildStructures(roomPositions);
      
      expect(result).toBe(true);
    });

    it('should return false when all structures are built', () => {
      const roomPositions: BaseStructures = {
        spawn: [{ x: 25, y: 25, built: true }],
        storage: [{ x: 22, y: 22, built: true }],
        link: [], tower: [], road: [], extension: [], container: [], wall: [], rampart: []
      };
      
      const result = shouldBuildStructures(roomPositions);
      
      expect(result).toBe(false);
    });
  });

  describe('memoizeRoomPositions', () => {
    it('should cache function results', () => {
      const room = createTestRoom();
      room.memory.roomPositions = {};
      
      const mockFn = jest.fn(() => ({ test: 'result' }));
      const memoized = memoizeRoomPositions(mockFn, room);
      
      // First call should execute function
      const result1 = memoized('W1N1');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ test: 'result' });
      
      // Second call should return cached result
      const result2 = memoized('W1N1');
      expect(mockFn).toHaveBeenCalledTimes(1); // Still only called once
      expect(result2).toEqual({ test: 'result' });
    });
  });

  describe('resetRoomPositions', () => {
    it('should log message and attempt to delete room positions from memory', () => {
      const testMemory: any = { roomPositions: { some: 'data' } };
      const room = {
        name: 'W1N1',
        memory: testMemory
      } as Room;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Verify the property exists before
      expect(testMemory.roomPositions).toBeDefined();
      
      resetRoomPositions(room);
      
      // The function should at least call console.log with the right message
      expect(consoleSpy).toHaveBeenCalledWith('Reset roomPositions for room: ', 'W1N1');
      
      // The delete operation should work on a plain object
      expect(testMemory.hasOwnProperty('roomPositions')).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });
});
