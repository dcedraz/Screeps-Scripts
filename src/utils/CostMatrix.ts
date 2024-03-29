import { HelperFunctions } from "./HelperFunctions";

export class CostMatrix {
  constructor(public r: Room, public matrix: number[] = []) {
    this.runMemoized();
  }

  runMemoized(): void {
    const memoizedMatrix = HelperFunctions.memoizeCostMatrix(this.calcMatrix.bind(this), this.r);
    this.deserialize(memoizedMatrix(this.r.name));
    // this.visualize(this.r.name, memoizedMatrix(this.r.name));
  }

  calcMatrix(): string {
    console.log("Calculating cost matrix for room: ", this.r.name);
    let sources = this.r.sources;
    let structures = this.r.structures;
    let constructionSites = this.r.cSites;
    let creeps = this.r.myCreeps;

    // set costs for terrain
    for (let y = 1; y < 49; y++) {
      for (let x = 1; x < 49; x++) {
        let terrain = this.r.getTerrain().get(x, y);
        if (terrain === TERRAIN_MASK_WALL) {
          this.set(x, y, 255);
        } else {
          this.set(x, y, 1);
        }
      }
    }

    // set costs for construction sites
    for (let site of constructionSites) {
      this.set(site.pos.x, site.pos.y, 255);
    }

    for (let source of sources) {
      this.set(source.pos.x, source.pos.y, 255);
    }

    Object.keys(structures).forEach((structType) => {
      for (const struct of structures[structType as keyof typeof structures]) {
        if (struct.structureType === STRUCTURE_ROAD) {
          this.set(struct.pos.x, struct.pos.y, 255);
        } else if (struct.structureType === STRUCTURE_CONTAINER) {
          this.set(struct.pos.x, struct.pos.y, 5);
        } else if (struct.structureType === STRUCTURE_RAMPART) {
          this.set(struct.pos.x, struct.pos.y, 255);
        } else if (struct.structureType !== STRUCTURE_WALL) {
          this.set(struct.pos.x, struct.pos.y, 255);
        }
      }
    });

    for (let creep of creeps) {
      this.set(creep.pos.x, creep.pos.y, 255);
    }
    return this.serialize();
  }

  // create visual for each position in the matrix
  public visualize(room: string, roomMatrix: string): void {
    this.deserialize(roomMatrix);
    console.log("Visualizing cost matrix...");
    for (let y = 0; y < 50; y++) {
      for (let x = 0; x < 50; x++) {
        let value = this.matrix[y * 50 + x];
        if (value === 255) {
          Game.rooms[room].visual.circle(x, y, {
            fill: "red",
            radius: 0.1,
          });
        } else if (value === 1) {
          Game.rooms[room].visual.circle(x, y, {
            fill: "green",
            radius: 0.1,
          });
        } else if (value === 5) {
          Game.rooms[room].visual.circle(x, y, {
            fill: "blue",
            radius: 0.1,
          });
        }
      }
    }
  }

  set(x: number, y: number, cost: number): void {
    this.matrix[y * 50 + x] = cost;
  }

  get(x: number, y: number): number {
    return this.matrix[y * 50 + x];
  }

  serialize(): string {
    return this.matrix.join(",");
  }

  deserialize(str: string): void {
    this.matrix = str.split(",").map((v) => parseInt(v));
  }

  reset(): void {
    console.log("Reset cost matrix for room: ", this.r.name);
    this.matrix = [];
    delete this.r.memory.roomCostMatrix;
  }
}
