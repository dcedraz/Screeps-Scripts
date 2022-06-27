export class CostMatrix {
  constructor() {
    this.matrix = [];
  }

  public static getCostMatrix(room: Room): CostMatrix {
    console.log("running");
    let matrix = new CostMatrix();
    let sources = room.find(FIND_SOURCES);
    let structures = room.find(FIND_STRUCTURES);
    let creeps = room.find(FIND_MY_CREEPS);

    for (let source of sources) {
      matrix.set(source.pos.x, source.pos.y, 1);
    }

    for (let structure of structures) {
      if (structure.structureType === STRUCTURE_ROAD) {
        matrix.set(structure.pos.x, structure.pos.y, 1);
      } else if (structure.structureType === STRUCTURE_CONTAINER) {
        matrix.set(structure.pos.x, structure.pos.y, 5);
      } else if (structure.structureType === STRUCTURE_RAMPART) {
        matrix.set(structure.pos.x, structure.pos.y, 255);
      } else if (structure.structureType !== STRUCTURE_WALL) {
        matrix.set(structure.pos.x, structure.pos.y, 255);
      }
    }

    for (let creep of creeps) {
      matrix.set(creep.pos.x, creep.pos.y, 255);
    }
    console.log(matrix.serialize());

    matrix.visualize(room);
    return matrix;
  }

  // create visual for each position in the matrix
  public visualize(room: Room): void {
    for (let y = 0; y < 50; y++) {
      for (let x = 0; x < 50; x++) {
        let value = this.matrix[y * 50 + x];
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

  public set(x: number, y: number, cost: number): void {
    this.matrix[y * 50 + x] = cost;
  }

  public get(x: number, y: number): number {
    return this.matrix[y * 50 + x];
  }

  public serialize(): string {
    return this.matrix.join(",");
  }

  private matrix: number[];
}
