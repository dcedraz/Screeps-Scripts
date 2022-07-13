export class RoomMatrix {
  constructor(public room: Room, public matrix: CostMatrix = new PathFinder.CostMatrix()) {}

  run() {
    console.log("running");
    let matrix = this.matrix;
    let room = this.room;
    let sources = room.find(FIND_SOURCES);
    let structures = room.find(FIND_STRUCTURES);
    let creeps = room.find(FIND_MY_CREEPS);

    // set costs for terrain
    for (let y = 1; y < 49; y++) {
      for (let x = 1; x < 49; x++) {
        let terrain = room.getTerrain().get(x, y);
        if (terrain === TERRAIN_MASK_WALL) {
          matrix.set(x, y, 255);
        } else {
          matrix.set(x, y, 1);
        }
      }
    }

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
  }

  // create visual for each position in the matrix
  visualize(room: Room): void {
    for (let y = 0; y < 50; y++) {
      for (let x = 0; x < 50; x++) {
        let value = this.matrix.get(x, y);
        console.log(value);
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
}
