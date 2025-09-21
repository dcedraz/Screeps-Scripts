import { CostMatrixData, createCostMatrix, getCost, resetCostMatrix } from "utils/CostMatrix";
import { HelperFunctions } from "utils/HelperFunctions";

// Core data structure
export interface StructuresData {
  readonly roomName: string;
  readonly roomPositions: BaseStructures;
  readonly roomSources: ReadonlyArray<Source>;
  readonly roomController: StructureController | undefined;
}

// Memoization function
export function memoizeRoomPositions(fn: any, room: Room) {
  if (!room.memory.roomPositions) {
    room.memory.roomPositions = {};
  }
  return (...args: any[]) => {
    let n = args[0];
    if (n in room.memory.roomPositions) {
      // console.log("Fetching RoomPositions from memory");
      return room.memory.roomPositions[n];
    } else {
      // console.log("Calculating RoomPositions for room: ", n);
      let result = fn(n);
      room.memory.roomPositions[n] = result;
      return result;
    }
  };
}

// Factory function
export function createStructuresData(room: Room, sources: Source[]): StructuresData {
  const costMatrix = createCostMatrix(room);
  const roomPositions = getMemoizedRoomPositions(room, costMatrix);
  
  // Run side effects
  buildRoomPositions(room, roomPositions, costMatrix);
  createSourceStructures(room, sources, costMatrix);
  createStructureVisuals(room, roomPositions);
  
  return {
    roomName: room.name,
    roomPositions,
    roomSources: Object.freeze([...sources]),
    roomController: room.controller
  };
}

// Pure calculation functions
export function calculateRoomPositions(room: Room, costMatrix: CostMatrixData): BaseStructures {
  console.log(`Calculating room positions for ${room.name}`);
  
  const roomPositions = HelperFunctions.emptyBaseStructures();
  
  // Calculate Spawn positions
  const initialSpawn = room.structures.spawn[0];
  const initialSpawnPos = initialSpawn.pos;
  const secondSpawnPos = checkPosOnMatrix(costMatrix, room, initialSpawn.pos.x - 3, initialSpawn.pos.y);
  const thirdSpawnPos = checkPosOnMatrix(costMatrix, room, initialSpawn.pos.x - 6, initialSpawn.pos.y);
  const initialX = initialSpawn.pos.x - 3;
  const initialY = initialSpawn.pos.y;
  
  if (initialSpawnPos) {
    roomPositions.spawn.push({
      x: initialSpawnPos.x,
      y: initialSpawnPos.y,
      built: true,
    });
  }
  if (secondSpawnPos) {
    roomPositions.spawn.push({
      x: secondSpawnPos.x,
      y: secondSpawnPos.y,
      built: false,
    });
  }
  if (thirdSpawnPos) {
    roomPositions.spawn.push({
      x: thirdSpawnPos.x,
      y: thirdSpawnPos.y,
      built: false,
    });
  }
  
  // Calculate Storage position
  const storagePos = checkPosOnMatrix(costMatrix, room, initialX, initialY - 3);
  if (storagePos) {
    roomPositions.storage.push({
      x: storagePos.x,
      y: storagePos.y,
      built: false,
    });
  }

  // Calculate Links positions
  const firstLinkPos = checkPosOnMatrix(costMatrix, room, initialX, initialY + 3);
  if (firstLinkPos) {
    roomPositions.link.push({
      x: firstLinkPos.x,
      y: firstLinkPos.y,
      built: false,
    });
  }

  // Calculate Towers positions
  const firstTowerPos = checkPosOnMatrix(costMatrix, room, initialX + 1, initialY + 1);
  const secondTowerPos = checkPosOnMatrix(costMatrix, room, initialX - 1, initialY + 1);
  const thirdTowerPos = checkPosOnMatrix(costMatrix, room, initialX + 1, initialY - 1);
  const fourthTowerPos = checkPosOnMatrix(costMatrix, room, initialX - 1, initialY - 1);
  
  if (firstTowerPos) {
    roomPositions.tower.push({
      x: firstTowerPos.x,
      y: firstTowerPos.y,
      built: false,
    });
  }
  if (secondTowerPos) {
    roomPositions.tower.push({
      x: secondTowerPos.x,
      y: secondTowerPos.y,
      built: false,
    });
  }
  if (thirdTowerPos) {
    roomPositions.tower.push({
      x: thirdTowerPos.x,
      y: thirdTowerPos.y,
      built: false,
    });
  }
  if (fourthTowerPos) {
    roomPositions.tower.push({
      x: fourthTowerPos.x,
      y: fourthTowerPos.y,
      built: false,
    });
  }

  // Calculate Extension positions
  const extensionsArray = [];
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX + 2, initialY + 1));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX - 2, initialY + 1));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX + 2, initialY - 1));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX - 2, initialY - 1));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX + 1, initialY + 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX - 1, initialY + 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX + 1, initialY - 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX - 1, initialY - 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX + 2, initialY + 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX - 2, initialY + 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX + 2, initialY - 2));
  extensionsArray.push(checkPosOnMatrix(costMatrix, room, initialX - 2, initialY - 2));

  for (const pos of extensionsArray) {
    if (pos) {
      roomPositions.extension.push({
        x: pos.x,
        y: pos.y,
        built: false,
      });
    }
  }

  // Calculate Roads positions
  const roadsFromSpawn = calculateRoadsAroundStructures(roomPositions.spawn);
  const roadsFromStorage = calculateRoadsAroundStructures(roomPositions.storage);
  const roadsFromLink = calculateRoadsAroundStructures(roomPositions.link);
  
  roomPositions.road.push(...roadsFromSpawn, ...roadsFromStorage, ...roadsFromLink);

  return roomPositions;
}

export function checkPositionsForRect(costMatrix: CostMatrixData, room: Room, rect: {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}): RoomPosition[] | undefined {
  const positions: RoomPosition[] = [];

  for (let x = rect.x1; x <= rect.x2; x++) {
    for (let y = rect.y1; y <= rect.y2; y++) {
      if (getCost(costMatrix, x, y) === 255 || x < 0 || x >= 50 || y < 0 || y >= 50) {
        return undefined;
      } else {
        const pos = room.getPositionAt(x, y);
        if (pos) positions.push(pos);
      }
    }
  }
  return positions;
}

export function checkPosOnMatrix(costMatrix: CostMatrixData, room: Room, x: number, y: number): RoomPosition | null {
  if (getCost(costMatrix, x, y) !== 255) {
    return room.getPositionAt(x, y);
  }
  return null;
}

export function calculateRoadsAroundStructures(structures: StructPos[]): StructPos[] {
  const roads: StructPos[] = [];
  
  for (const pos of structures) {
    const x = pos.x;
    const y = pos.y;
    for (let i = 1; i <= 2; i++) {
      const roadPositions = [
        { x: x + i, y: y },
        { x: x - i, y: y },
        { x: x, y: y + i },
        { x: x, y: y - i }
      ];
      
      for (const roadPos of roadPositions) {
        roads.push({
          x: roadPos.x,
          y: roadPos.y,
          built: false,
        });
      }
    }
  }
  
  return roads;
}

// Construction functions
export function createConstructionSite(room: Room, costMatrix: CostMatrixData, x: number, y: number, structureType: BuildableStructureConstant): boolean {
  if (getCost(costMatrix, x, y) !== 255) {
    const result = room.createConstructionSite(x, y, structureType);
    return result === OK;
  } else {
    console.log(`CostMatrix error: failed to build ${structureType} at ${x},${y}`);
    return false;
  }
}

export function shouldBuildStructures(roomPositions: BaseStructures): boolean {
  return Object.keys(roomPositions).some((struct) => {
    return roomPositions[struct as keyof typeof roomPositions].some(pos => !pos.built);
  });
}

// Source-specific functions
export function createSourceStructures(room: Room, sources: Source[], costMatrix: CostMatrixData): void {
  if (room.controller && room.controller.level > 1) {
    const spawn = room.structures.spawn[0];
    const initialPos = room.getPositionAt(spawn.pos.x, spawn.pos.y);
    
    for (const source of sources) {
      if (!room.memory.sourcesMapped) {
        room.memory.sourcesMapped = [];
      }

      if (room.memory.sourcesMapped.indexOf(source.id) === -1 && initialPos) {
        const path = room.findPath(initialPos, source.pos, {
          maxOps: 100,
          ignoreCreeps: true,
          ignoreDestructibleStructures: true,
          swampCost: 1,
        });
        
        if (path.length > 0) {
          for (let i = 0; i < path.length - 2; i++) {
            createConstructionSite(room, costMatrix, path[i].x, path[i].y, STRUCTURE_ROAD);
          }
        }
        
        const containerPos = room.getPositionAt(path[path.length - 2].x, path[path.length - 2].y);
        if (containerPos) {
          createConstructionSite(room, costMatrix, containerPos.x, containerPos.y, STRUCTURE_CONTAINER);
        }

        room.memory.sourcesMapped.push(source.id);
        
        // Find creep assigned to source
        const creeps = room.myCreeps.filter((creep) => creep.memory.assigned_source === source.id);
        
        // Assign container pos to creep memory
        if (creeps.length > 0 && containerPos) {
          creeps[0].memory.container_pos = containerPos;
          if (!room.memory.source_containers[source.id]) {
            room.memory.source_containers[source.id] = [];
          }
          room.memory.source_containers[source.id].push(containerPos);
        }
        
        resetCostMatrix(room);
      }
    }
  }
}

// Memoization wrapper
export function getMemoizedRoomPositions(room: Room, costMatrix: CostMatrixData): BaseStructures {
  const memoizedcalcRoomPositions = memoizeRoomPositions(
    () => calculateRoomPositions(room, costMatrix),
    room
  );
  return memoizedcalcRoomPositions(room.name);
}

// Visual functions
export function createStructureVisuals(room: Room, roomPositions: BaseStructures): void {
  for (const pos of roomPositions.spawn) {
    room.visual.text("Spawn", pos.x, pos.y, {
      color: "#ff0000",
      font: 0.5,
    });
  }
  for (const pos of roomPositions.storage) {
    room.visual.text("Storage", pos.x, pos.y, {
      color: "#ff0000",
      font: 0.5,
    });
  }
  for (const pos of roomPositions.link) {
    room.visual.text("Link", pos.x, pos.y, {
      color: "#ff0000",
      font: 0.5,
    });
  }
  for (const pos of roomPositions.tower) {
    room.visual.text("Tower", pos.x, pos.y, {
      color: "#ff0000",
      font: 0.5,
    });
  }
  for (const pos of roomPositions.road) {
    Game.rooms[room.name].visual.circle(pos.x, pos.y, {
      fill: "blue",
      radius: 0.1,
    });
  }
  for (const pos of roomPositions.extension) {
    Game.rooms[room.name].visual.circle(pos.x, pos.y, {
      fill: "yellow",
      radius: 0.1,
    });
  }
}

// Side effect functions
export function buildRoomPositions(room: Room, roomPositions: BaseStructures, costMatrix: CostMatrixData): void {
  if (
    room.controller &&
    room.controller.level > 1 &&
    shouldBuildStructures(roomPositions) &&
    Game.time % 100 === 0
  ) {
    Object.keys(roomPositions).forEach((struct) => {
      for (const pos of roomPositions[struct as keyof typeof roomPositions]) {
        if (pos.built === false) {
          pos.built = createConstructionSite(room, costMatrix, pos.x, pos.y, struct as BuildableStructureConstant);
        }
      }
    });
  }
}

export function runStructuresLogic(room: Room, sources: Source[]): void {
  createStructuresData(room, sources);
}

// Reset function
export function resetRoomPositions(room: Room): void {
  console.log("Reset roomPositions for room: ", room.name);
  delete room.memory.roomPositions;
}
