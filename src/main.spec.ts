import { mockGlobal, mockInstanceOf, mockStructure } from "screeps-jest";
import { RoomInstance } from "RoomInstance";
// import "utils/roomAdditions";

const myController = mockInstanceOf<StructureController>({
  my: true,
  id: "myController",
  pos: { x: 10, y: 20 },
  level: 1
});
const spawn1 = mockStructure(STRUCTURE_SPAWN, {
  pos: { x: 10, y: 20 },
  spawning: null,
  spawnCreep: jest.fn(),
});
const tower1 = mockStructure(STRUCTURE_TOWER);
const tower2 = mockStructure(STRUCTURE_TOWER);

const myRoom = mockInstanceOf<Room>(
  {
    name: "myRoom",
    controller: myController,
    structures: {
      STRUCTURE_SPAWN: [spawn1],
      STRUCTURE_CONTROLLER: [myController],
    },
    sources: [],
    memory: {},
    getTerrain: jest.fn().mockReturnValue({ get: jest.fn() }),
    cSites: [],
    myCreeps: [],
    getPositionAt: jest.fn().mockReturnValue({ x: 10, y: 20 }),
    visual: {
      text: jest.fn(),
      circle: jest.fn()
    },
  },
  true
);

Object.defineProperty(myRoom.structures, "spawn", {
  get() {
    return [spawn1]
  },
});

const mockRun = jest.fn();
jest.mock("RoomInstance", () => {
  return {
    RoomInstance: jest.fn().mockImplementation(() => {
      return {
        roomController: true,
        run: mockRun,
      };
    }),
  };
});

mockGlobal<Game>(
  "Game",
  {
    creeps: {},
    rooms: {
      myRoom,
    },
    time: 1,
    structures: {
      [myController.id]: myController,
      [spawn1.id]: spawn1,
    },
    cpu: {
      getUsed: jest.fn(),
    },
    getObjectById: jest.fn().mockImplementation((id) => {
      return {
        [myController.id]: myController,
        [spawn1.id]: spawn1,
      }[id];
    })
  },
  true
);
Object.defineProperty(Game.structures, "length", {
  value: 0,
});

mockGlobal<Memory>("Memory", { creeps: {} });
mockGlobal<RawMemory>("RawMemory", { _parsed: {} });

// jest.mock("utils/memhack");
// jest.mock("utils/roomAdditions");

import { unwrappedLoop } from "./main";

describe("main loop", () => {

  it("runs every room", () => {
      mockGlobal<Memory>("Memory", { creeps: {} });
      unwrappedLoop();
      expect(RoomInstance).toHaveBeenCalledWith(myRoom);
      expect(mockRun).toHaveBeenCalled();
  });
//   it("runs every creep", () => {
//     mockGlobal<Game>("Game", {
//       creeps: {
//         builder,
//         harvester,
//         upgrader,
//       },
//       rooms: {},
//       time: 1,
//     });
//     mockGlobal<Memory>("Memory", { creeps: {} });
//     unwrappedLoop();
//     expect(roleBuilder.run).toHaveBeenCalledWith(builder);
//     expect(roleHarvester.run).toHaveBeenCalledWith(harvester);
//     expect(roleUpgrader.run).toHaveBeenCalledWith(upgrader);
//   });

//   it("cleans up the memory from deceased creeps", () => {
//     mockGlobal<Game>("Game", {
//       creeps: { stillKicking: harvester },
//       rooms: {},
//       time: 1,
//     });
//     mockGlobal<Memory>("Memory", {
//       creeps: {
//         dead: { role: "garbage" },
//         goner: { role: "waste" },
//         stillKicking: harvester.memory,
//       },
//     });
//     unwrappedLoop();
//     expect(Memory.creeps).toEqual({ stillKicking: harvester.memory });
//   });

//   it("runs every tower in my rooms", () => {
//     mockGlobal<Game>("Game", {
//       creeps: {},
//       rooms: {
//         myRoomWithTowers,
//         myRoomWithoutTowers,
//         noOnesRoom,
//         someoneElsesRoom,
//       },
//       time: 1,
//     });
//     mockGlobal<Memory>("Memory", { creeps: {} });
//     unwrappedLoop();
//     expect(runTower).toHaveBeenCalledWith(tower1);
//     expect(runTower).toHaveBeenCalledWith(tower2);
//   });
});