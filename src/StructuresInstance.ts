import { HelperFunctions } from "utils/HelperFunctions";

export class StructuresInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomSources: Source[];

  constructor(room: Room, sources: Source[]) {
    this.room = room;
    this.roomSources = sources;
    this.roomController = room.controller;
  }

  createExtensions(): void {
    if (this.roomController && this.roomController.level > 1) {
      let extensionCount = HelperFunctions.getExtensionCount(this.roomController.level);
      let extensionPositions = this.room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });
      if (extensionPositions.length < extensionCount) {
        for (let i = extensionPositions.length; i < extensionCount; i++) {
          this.room.createConstructionSite(extensionPositions[i].pos, STRUCTURE_EXTENSION);
        }
      }
    }
  }

  createPathToSources() {
    if (this.roomController && this.roomController.level > 1) {
      let spawns = this.room.find(FIND_MY_SPAWNS);
      let sources = this.roomSources;
      for (let spawn of spawns) {
        for (let source of sources) {
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
        }
      }
    }
  }

  run() {
    // this.createExtensions();
    this.createPathToSources();
  }
}
