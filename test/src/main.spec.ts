import { mockGlobal, mockInstanceOf } from 'screeps-jest';

jest.mock("utils/roomAdditions", () => ({}));
jest.mock("utils/memhack", () => ({
  default: {
    pretick: jest.fn(),
    register: jest.fn(),
    memory: {},
    parseTime: 0
  }
}));

describe("main loop", () => {
  it("should run roomInstance.run for each room in Game.rooms", () => {
    const mockRun = jest.fn();
    const mockRoomInstance = jest.fn().mockImplementation(() => ({
      roomController: true,
      run: mockRun,
    }));
    const mockCreateRoomInstance = jest.fn().mockReturnValue({
      roomController: true,
      roomCreeps: { run: jest.fn() },
      roomSpawner: { run: jest.fn() }
    });
    const mockRunRoom = jest.fn();
    jest.doMock("../../src/RoomInstance", () => ({
      createRoomInstance: mockCreateRoomInstance,
      runRoom: mockRunRoom,
    }));

    const myController = mockInstanceOf<StructureController>({ my: true });
    const roomA = mockInstanceOf<Room>({ controller: myController, structures: { spawn: [] }, pos: { findClosestByRange: jest.fn().mockReturnValue(null) } });
    const roomB = mockInstanceOf<Room>({ controller: myController, structures: { spawn: [] }, pos: { findClosestByRange: jest.fn().mockReturnValue(null) } });

    mockGlobal<Game>('Game', {
      rooms: { roomA, roomB },
      creeps: {},
      time: 1,
      cpu: { getUsed: jest.fn().mockReturnValue(0), limit: 100, bucket: 10000 },
      gcl: { level: 1, progress: 0, progressTotal: 1000 },
      structures: [] as any
    });
    mockGlobal<Memory>('Memory', { creeps: {} });

    const { unwrappedLoop } = require("../../src/main");
    unwrappedLoop();

    expect(mockCreateRoomInstance).toHaveBeenCalledTimes(2);
    expect(mockRunRoom).toHaveBeenCalledTimes(2);
  });

  it("should delete memory of missing creeps", () => {
    const creep2 = mockInstanceOf<Creep>({});
    mockGlobal<Game>('Game', {
      time: 100,
      creeps: { creep2 },
      rooms: {},
      cpu: { getUsed: jest.fn().mockReturnValue(0), limit: 100, bucket: 10000 },
      gcl: { level: 1, progress: 0, progressTotal: 1000 },
      structures: [] as any
    });
    mockGlobal<Memory>('Memory', {
      creeps: {
        creep1: {} as CreepMemory,
        creep2: {} as CreepMemory,
      },
    });

    const { unwrappedLoop } = require("../../src/main");
    unwrappedLoop();

    expect(Memory.creeps).toEqual({ creep2: {} as CreepMemory });
  });
});
