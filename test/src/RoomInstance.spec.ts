import { mockInstanceOf } from 'screeps-jest';
import { createRoomInstance, runSafeMode, findAvailableSources, spawnHarvesters, spawnHaulers, spawnUpgraders, spawnBuilders, runSpawnLogic, runRoom } from '../../src/RoomInstance';
import { SpawnerInstance, createSpawnerInstance, spawnQueueAdd, runSpawner } from "SpawnerInstance";
import { CreepsInstance, createCreepsInstance, createSpawnWorkOrder, runCreeps } from "CreepsInstance";
import { StructuresData, createStructuresData } from "StructuresInstance";

jest.mock("SpawnerInstance");
jest.mock("CreepsInstance");
jest.mock("StructuresInstance");

function createRoomInstanceForTesting({
  controller = mockInstanceOf<StructureController>({
    level: 2,
    safeMode: undefined,
    safeModeCooldown: undefined,
    activateSafeMode: jest.fn(),
  }),
  spawner = {
    room: mockInstanceOf<Room>({}),
    spawns: [],
    spawnQueue: [],
  },
  creepsInstance = {
    room: mockInstanceOf<Room>({}),
    creeps: [],
    harvesters: [],
    haulers: [],
    upgraders: [],
    builders: [],
    creepBodies: {
      harvesters: [WORK, CARRY, MOVE],
      haulers: [CARRY, CARRY, MOVE],
      upgraders: [WORK, CARRY, MOVE],
      builders: [WORK, CARRY, MOVE],
    },
  },
  sources = [
    mockInstanceOf<Source>({ 
      id: 'source1',
      pos: { findInRange: jest.fn(() => []) }
    }),
    mockInstanceOf<Source>({ 
      id: 'source2',
      pos: { findInRange: jest.fn(() => []) }
    })
  ],
  structuresData = mockInstanceOf<StructuresData>({
    roomName: 'TestRoom',
    roomPositions: {
      spawn: [], storage: [], link: [], tower: [], road: [], extension: [], container: [], wall: [], rampart: []
    },
    roomSources: sources,
    roomController: controller
  }),
}: {
  controller?: StructureController;
  spawner?: SpawnerInstance;
  creepsInstance?: CreepsInstance;
  structuresData?: StructuresData;
  sources?: Source[];
} = {}) {
    // Mock the constructor calls
  (createSpawnerInstance as jest.MockedFunction<typeof createSpawnerInstance>).mockReturnValue(spawner);
  (spawnQueueAdd as jest.MockedFunction<typeof spawnQueueAdd>).mockImplementation(() => {});
  (runSpawner as jest.MockedFunction<typeof runSpawner>).mockImplementation(() => {});
  (createCreepsInstance as jest.MockedFunction<typeof createCreepsInstance>).mockReturnValue(creepsInstance);
  (createSpawnWorkOrder as jest.MockedFunction<typeof createSpawnWorkOrder>).mockImplementation((role, body, priority, roomName, source) => ({
    name: `Initial_${role}`,
    body: body,
    memory: { role: role, working: false, room: roomName, assigned_source: source?.id },
    priority: priority,
  }));
  (runCreeps as jest.MockedFunction<typeof runCreeps>).mockImplementation(() => {});
  (createStructuresData as jest.MockedFunction<typeof createStructuresData>).mockReturnValue(structuresData);

  const room = mockInstanceOf<Room>({ 
    controller, 
    sources, 
    find: jest.fn(() => []),
    name: 'TestRoom'
  });
  return {
    room,
    spawner,
    creeps: creepsInstance,
    structuresData,
    sources
  };
}

describe('RoomInstance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoomInstance', () => {
    it('creates a room instance with all required properties', () => {
      const { room, spawner, creeps, structuresData, sources } = createRoomInstanceForTesting();
      
      const roomInstance = createRoomInstance(room);

      expect(roomInstance.room).toBe(room);
      expect(roomInstance.roomController).toBe(room.controller);
      expect(roomInstance.roomSpawner).toBe(spawner);
      expect(roomInstance.roomSources).toEqual(sources);
      expect(roomInstance.roomStructuresData).toBe(structuresData);
      expect(roomInstance.roomCreeps).toBe(creeps);
    });
  });

  describe('runSafeMode', () => {
    it('activates safe mode when conditions are met', () => {
      const { room } = createRoomInstanceForTesting({
        controller: mockInstanceOf<StructureController>({
          level: 2,
          safeMode: undefined,
          safeModeCooldown: undefined,
          activateSafeMode: jest.fn(),
        })
      });
      const roomInstance = createRoomInstance(room);

      runSafeMode(roomInstance);

      expect(roomInstance.roomController?.activateSafeMode).toHaveBeenCalled();
    });

    it('does not activate safe mode when conditions are not met', () => {
      const { room } = createRoomInstanceForTesting({
        controller: mockInstanceOf<StructureController>({
          level: 1,
          safeMode: undefined,
          safeModeCooldown: undefined,
          activateSafeMode: jest.fn(),
        })
      });
      const roomInstance = createRoomInstance(room);

      runSafeMode(roomInstance);

      expect(roomInstance.roomController?.activateSafeMode).not.toHaveBeenCalled();
    });
  });

  describe('findAvailableSources', () => {
    it('returns sources not assigned to any creeps', () => {
      const { room, sources } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);
      const creeps: Creep[] = [];

      const availableSources = findAvailableSources(roomInstance, creeps);

      expect(availableSources).toEqual(sources);
    });

    it('excludes sources assigned to creeps', () => {
      const { room, sources } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);
      const creeps: Creep[] = [
        mockInstanceOf<Creep>({ memory: { assigned_source: sources[0].id } })
      ];

      const availableSources = findAvailableSources(roomInstance, creeps);

      expect(availableSources).toEqual([sources[1]]);
    });
  });

  describe('spawnHarvesters', () => {
    it('spawns harvester when less than sources', () => {
      const { room, spawner, creeps } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);

      spawnHarvesters(roomInstance);

      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_harvester'),
        body: creeps.creepBodies.harvesters,
        memory: expect.objectContaining({ role: 'harvester' })
      }));
    });

    it('does not spawn when enough harvesters exist', () => {
      const { room, spawner, creeps, sources } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);
      
      // Mock that we have enough harvesters
      creeps.harvesters = Array(sources.length).fill(mockInstanceOf<Creep>({}));

      spawnHarvesters(roomInstance);

      expect(spawnQueueAdd).not.toHaveBeenCalled();
    });
  });

  describe('spawnHaulers', () => {
    it('spawns hauler when needed', () => {
      const { room, spawner, creeps } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);
      
      // Set up condition: have harvesters but no haulers
      creeps.harvesters = [mockInstanceOf<Creep>({ memory: { assigned_source: undefined } })];

      spawnHaulers(roomInstance);

      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_hauler'),
        body: creeps.creepBodies.haulers,
        memory: expect.objectContaining({ role: 'hauler' })
      }));
    });
  });

  describe('spawnUpgraders', () => {
    it('spawns upgrader when needed', () => {
      const { room, spawner, creeps } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);

      spawnUpgraders(roomInstance);

      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_upgrader'),
        body: creeps.creepBodies.upgraders,
        memory: expect.objectContaining({ role: 'upgrader' })
      }));
    });
  });

  describe('spawnBuilders', () => {
    it('spawns builder when needed', () => {
      const { room, spawner, creeps } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);

      spawnBuilders(roomInstance);

      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_builder'),
        body: creeps.creepBodies.builders,
        memory: expect.objectContaining({ role: 'builder' })
      }));
    });
  });

  describe('runSpawnLogic', () => {
    it('runs all spawn functions', () => {
      const { room, spawner, creeps } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);
      
      // Set up condition: have harvesters but no haulers
      creeps.harvesters = [mockInstanceOf<Creep>({ memory: { assigned_source: undefined } })];

      runSpawnLogic(roomInstance);

      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_harvester'),
        body: creeps.creepBodies.harvesters,
        memory: expect.objectContaining({ role: 'harvester' })
      }));
      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_hauler'),
        body: creeps.creepBodies.haulers,
        memory: expect.objectContaining({ role: 'hauler' })
      }));
      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_upgrader'),
        body: creeps.creepBodies.upgraders,
        memory: expect.objectContaining({ role: 'upgrader' })
      }));
      expect(spawnQueueAdd).toHaveBeenCalledWith(spawner, expect.objectContaining({
        name: expect.stringContaining('Initial_builder'),
        body: creeps.creepBodies.builders,
        memory: expect.objectContaining({ role: 'builder' })
      }));
    });
  });

  describe('runRoom', () => {
    it('runs all room logic including safe mode, spawn logic, creeps and spawner', () => {
      const { room, spawner, creeps } = createRoomInstanceForTesting();
      const roomInstance = createRoomInstance(room);

      runRoom(roomInstance);

      expect(runCreeps).toHaveBeenCalledWith(creeps);
      expect(runSpawner).toHaveBeenCalledWith(spawner);
    });
  });
});
