import { HelperFunctions } from "./HelperFunctions";

// Core data structure
export interface CostMatrixData {
  readonly matrix: ReadonlyArray<number>;
  readonly roomName: string;
}

// Memoization function
export function memoizeCostMatrix(fn: any, room: Room) {
  if (!room.memory.roomCostMatrix) {
    room.memory.roomCostMatrix = {};
  }
  return (...args: any[]) => {
    let n = args[0];
    if (n in room.memory.roomCostMatrix) {
      //console.log("Fetching CostMatrix from memory");
      return room.memory.roomCostMatrix[n];
    } else {
      //console.log("Calculating CostMatrix for room: ", n);
      let result = fn(n);
      room.memory.roomCostMatrix[n] = result;
      return result;
    }
  };
}

// Factory function
export function createCostMatrix(room: Room): CostMatrixData {
  return getMemoizedCostMatrix(room);
}

// Pure calculation functions
export function calculateCostMatrix(room: Room): CostMatrixData {
  console.log("Calculating cost matrix for room: ", room.name);
  
  let matrix: number[] = new Array(2500); // 50x50 grid
  const sources = room.sources;
  const structures = room.structures;
  const constructionSites = room.cSites;
  const creeps = room.myCreeps;

  // Set costs for terrain
  for (let y = 1; y < 49; y++) {
    for (let x = 1; x < 49; x++) {
      const terrain = room.getTerrain().get(x, y);
      if (terrain === TERRAIN_MASK_WALL) {
        matrix[y * 50 + x] = 255;
      } else {
        matrix[y * 50 + x] = 1;
      }
    }
  }

  // Set costs for construction sites
  for (const site of constructionSites) {
    matrix[site.pos.y * 50 + site.pos.x] = 255;
  }

  // Set costs for sources
  for (const source of sources) {
    matrix[source.pos.y * 50 + source.pos.x] = 255;
  }

  // Set costs for structures
  Object.keys(structures).forEach((structType) => {
    for (const struct of structures[structType as keyof typeof structures]) {
      if (struct.structureType === STRUCTURE_ROAD) {
        matrix[struct.pos.y * 50 + struct.pos.x] = 255;
      } else if (struct.structureType === STRUCTURE_CONTAINER) {
        matrix[struct.pos.y * 50 + struct.pos.x] = 5;
      } else if (struct.structureType === STRUCTURE_RAMPART) {
        matrix[struct.pos.y * 50 + struct.pos.x] = 255;
      } else if (struct.structureType !== STRUCTURE_WALL) {
        matrix[struct.pos.y * 50 + struct.pos.x] = 255;
      }
    }
  });

  // Set costs for creeps
  for (const creep of creeps) {
    matrix[creep.pos.y * 50 + creep.pos.x] = 255;
  }

  return {
    matrix: Object.freeze(matrix),
    roomName: room.name
  };
}

export function getCost(matrix: CostMatrixData, x: number, y: number): number {
  return matrix.matrix[y * 50 + x];
}

export function setCost(matrix: CostMatrixData, x: number, y: number, cost: number): CostMatrixData {
  const newMatrix = [...matrix.matrix];
  newMatrix[y * 50 + x] = cost;
  return {
    matrix: Object.freeze(newMatrix),
    roomName: matrix.roomName
  };
}

// Serialization functions
export function serializeCostMatrix(matrix: CostMatrixData): string {
  return matrix.matrix.join(",");
}

export function deserializeCostMatrix(serialized: string, roomName: string): CostMatrixData {
  const matrix = serialized.split(",").map((v) => parseInt(v));
  return {
    matrix: Object.freeze(matrix),
    roomName
  };
}

// Memoization wrapper
export function getMemoizedCostMatrix(room: Room): CostMatrixData {
  const memoizedMatrix = memoizeCostMatrix(
    () => serializeCostMatrix(calculateCostMatrix(room)),
    room
  );
  return deserializeCostMatrix(memoizedMatrix(room.name), room.name);
}

// Visualization function
export function visualizeCostMatrix(room: Room, matrix: CostMatrixData): void {
  console.log("Visualizing cost matrix...");
  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      const value = matrix.matrix[y * 50 + x];
      if (value === 255) {
        Game.rooms[room.name].visual.circle(x, y, {
          fill: "red",
          radius: 0.1,
        });
      } else if (value === 1) {
        Game.rooms[room.name].visual.circle(x, y, {
          fill: "green",
          radius: 0.1,
        });
      } else if (value === 5) {
        Game.rooms[room.name].visual.circle(x, y, {
          fill: "blue",
          radius: 0.1,
        });
      }
    }
  }
}

// Reset function
export function resetCostMatrix(room: Room): void {
  console.log("Reset cost matrix for room: ", room.name);
  delete room.memory.roomCostMatrix;
}
