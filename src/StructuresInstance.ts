import { HelperFunctions } from "utils/HelperFunctions";

export class StructuresInstance {
  constructor(
    public room: Room,
    public roomSources: Source[],
    public roomController: StructureController | undefined = room.controller
  ) {}

  createExtensions(): void {
    if (this.roomController && this.roomController.level > 1) {
      let mainSpawn = this.room.find(FIND_MY_SPAWNS)[0];
      let initialPos = this.room.getPositionAt(mainSpawn.pos.x, mainSpawn.pos.y + 1);

      let extensionCount = HelperFunctions.getExtensionCount(this.roomController.level);
      let extensionPositions = this.room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });
      if (extensionPositions.length < 1 && initialPos) {
        this.room.createConstructionSite(initialPos, STRUCTURE_EXTENSION);
      }
      if (extensionPositions.length < extensionCount) {
        for (let i = extensionPositions.length - 1; i < extensionCount; i++) {
          if (i % 2 === 0) {
            let targetPos = this.room.getPositionAt(
              extensionPositions[i].pos.x - 1,
              extensionPositions[i].pos.y
            );
            if (targetPos) {
              this.room.createConstructionSite(targetPos, STRUCTURE_EXTENSION);
            }
          } else {
            let targetPos = this.room.getPositionAt(
              extensionPositions[i].pos.x,
              extensionPositions[i].pos.y - 1
            );
            if (targetPos) {
              this.room.createConstructionSite(targetPos, STRUCTURE_EXTENSION);
            }
          }
        }
      }
    }
  }

  createSourceStructures() {
    if (this.roomController && this.roomController.level > 1) {
      let spawns = this.room.find(FIND_MY_SPAWNS);
      let sources = this.roomSources;

      for (let spawn of spawns) {
        for (let source of sources) {
          if (!this.room.memory.sourcesMapped) {
            this.room.memory.sourcesMapped = [];
          }

          if (this.room.memory.sourcesMapped.indexOf(source.id) === -1) {
            let path = this.room.findPath(spawn.pos, source.pos, {
              maxOps: 100,
              ignoreCreeps: true,
              ignoreDestructibleStructures: true,
              swampCost: 1,
            });
            if (path.length > 0) {
              for (let i = 0; i < path.length - 2; i++) {
                this.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
              }
            }
            this.room.createConstructionSite(
              path[path.length - 2].x,
              path[path.length - 2].y,
              STRUCTURE_CONTAINER
            );

            this.room.memory.sourcesMapped.push(source.id);
          }
        }
      }
    }
  }

  run() {
    this.createExtensions();
    this.createSourceStructures();
  }
}
