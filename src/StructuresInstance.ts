import { HelperFunctions } from "utils/HelperFunctions";

export class StructuresInstance {
  constructor(
    public room: Room,
    public roomController: StructureController | undefined = room.controller
  ) {}

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

  run() {
    // this.createExtensions();
  }
}
