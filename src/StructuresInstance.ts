import { CostMatrix } from "utils/CostMatrix";
import { HelperFunctions } from "utils/HelperFunctions";

export class StructuresInstance {
  constructor(
    public r: Room,
    public roomSources: Source[],
    public roomController: StructureController | undefined = r.controller,
    public myConstructionSites: ConstructionSite[] = r.find(FIND_CONSTRUCTION_SITES),
    public roomCostMaxtrix: CostMatrix = new CostMatrix(r),
    public roomPositions: BaseStructures = HelperFunctions.emptyBaseStructures()
  ) {
    this.runMemoized();
    this.sortConstructionSites();
    this.buildRoomPositions();
    this.createSourceStructures();
  }

  runMemoized(): void {
    const memoizedcalcRoomPositions = HelperFunctions.memoizeRoomPositions(
      this.calcRoomPositions.bind(this),
      this.r
    );
    this.roomPositions = memoizedcalcRoomPositions(this.r.name);
    // this.createVisuals();
  }

  calcRoomPositions(): Object {
    console.log(`Calculating room positions for ${this.r.name}`);
    // Calculate Spawn positions
    const initialSpawn = this.r.find(FIND_MY_SPAWNS)[0];
    const initialSpawnPos = this.r.getPositionAt(initialSpawn.pos.x, initialSpawn.pos.y);
    const secondSpawnPos = this.r.getPositionAt(initialSpawn.pos.x - 3, initialSpawn.pos.y);
    const thirdSpawnPos = this.r.getPositionAt(initialSpawn.pos.x - 6, initialSpawn.pos.y);
    const initialX = initialSpawn.pos.x - 3;
    const initialY = initialSpawn.pos.y;
    if (initialSpawnPos) {
      this.roomPositions.spawn.push({
        x: initialSpawnPos.x,
        y: initialSpawnPos.y,
        built: true,
      });
    }
    if (secondSpawnPos) {
      this.roomPositions.spawn.push({
        x: secondSpawnPos.x,
        y: secondSpawnPos.y,
        built: false,
      });
    }
    if (thirdSpawnPos) {
      this.roomPositions.spawn.push({
        x: thirdSpawnPos.x,
        y: thirdSpawnPos.y,
        built: false,
      });
    }
    // Calculate Storage position
    const storagePos = this.r.getPositionAt(initialX, initialY - 3);
    if (storagePos) {
      this.roomPositions.storage.push({
        x: storagePos.x,
        y: storagePos.y,
        built: false,
      });
    }

    // Calculate Links positions
    const firstLinkPos = this.r.getPositionAt(initialX, initialY + 3);
    if (firstLinkPos) {
      this.roomPositions.link.push({
        x: firstLinkPos.x,
        y: firstLinkPos.y,
        built: false,
      });
    }

    // Calculate Towers positions
    const firstTowerPos = this.r.getPositionAt(initialX + 1, initialY + 1);
    const secondTowerPos = this.r.getPositionAt(initialX - 1, initialY + 1);
    const thirdTowerPos = this.r.getPositionAt(initialX + 1, initialY - 1);
    const fourthTowerPos = this.r.getPositionAt(initialX - 1, initialY - 1);
    if (firstTowerPos) {
      this.roomPositions.tower.push({
        x: firstTowerPos.x,
        y: firstTowerPos.y,
        built: false,
      });
    }
    if (secondTowerPos) {
      this.roomPositions.tower.push({
        x: secondTowerPos.x,
        y: secondTowerPos.y,
        built: false,
      });
    }
    if (thirdTowerPos) {
      this.roomPositions.tower.push({
        x: thirdTowerPos.x,
        y: thirdTowerPos.y,
        built: false,
      });
    }
    if (fourthTowerPos) {
      this.roomPositions.tower.push({
        x: fourthTowerPos.x,
        y: fourthTowerPos.y,
        built: false,
      });
    }

    // Calculate Extension positions
    let extensionsArray = [];
    extensionsArray.push(this.r.getPositionAt(initialX + 2, initialY + 1));
    extensionsArray.push(this.r.getPositionAt(initialX - 2, initialY + 1));
    extensionsArray.push(this.r.getPositionAt(initialX + 2, initialY - 1));
    extensionsArray.push(this.r.getPositionAt(initialX - 2, initialY - 1));
    extensionsArray.push(this.r.getPositionAt(initialX + 1, initialY + 2));
    extensionsArray.push(this.r.getPositionAt(initialX - 1, initialY + 2));
    extensionsArray.push(this.r.getPositionAt(initialX + 1, initialY - 2));
    extensionsArray.push(this.r.getPositionAt(initialX - 1, initialY - 2));
    extensionsArray.push(this.r.getPositionAt(initialX + 2, initialY + 2));
    extensionsArray.push(this.r.getPositionAt(initialX - 2, initialY + 2));
    extensionsArray.push(this.r.getPositionAt(initialX + 2, initialY - 2));
    extensionsArray.push(this.r.getPositionAt(initialX - 2, initialY - 2));

    for (const pos of extensionsArray) {
      if (pos) {
        this.roomPositions.extension.push({
          x: pos.x,
          y: pos.y,
          built: false,
        });
      }
    }

    // Calculate Roads positions
    this.calcRoadsAroundStructures(this.roomPositions.spawn);
    this.calcRoadsAroundStructures(this.roomPositions.storage);
    this.calcRoadsAroundStructures(this.roomPositions.link);

    return this.roomPositions;
  }

  calcRoadsAroundStructures(structures: StructPos[]) {
    for (const pos of structures) {
      let x = pos.x;
      let y = pos.y;
      for (let i = 1; i < 2; i++) {
        let roadPosArray = [];
        roadPosArray.push(this.r.getPositionAt(x + i, y));
        roadPosArray.push(this.r.getPositionAt(x - i, y));
        roadPosArray.push(this.r.getPositionAt(x, y + i));
        roadPosArray.push(this.r.getPositionAt(x, y - i));
        for (const roadPos of roadPosArray) {
          if (roadPos) {
            this.roomPositions.road.push({
              x: roadPos.x,
              y: roadPos.y,
              built: false,
            });
          }
        }
      }
    }
  }

  // Create visuals for roomPostiions
  createVisuals(): void {
    for (const pos of this.roomPositions.spawn) {
      this.r.visual.text("Spawn", pos.x, pos.y, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.storage) {
      this.r.visual.text("Storage", pos.x, pos.y, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.link) {
      this.r.visual.text("Link", pos.x, pos.y, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.tower) {
      this.r.visual.text("Tower", pos.x, pos.y, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.road) {
      Game.rooms[this.r.name].visual.circle(pos.x, pos.y, {
        fill: "blue",
        radius: 0.1,
      });
    }
    for (const pos of this.roomPositions.extension) {
      Game.rooms[this.r.name].visual.circle(pos.x, pos.y, {
        fill: "yellow",
        radius: 0.1,
      });
    }
  }

  createExtensions(): void {
    if (this.roomController && this.roomController.level > 1) {
      let extensionCount = CONTROLLER_STRUCTURES.extension[this.roomController.level];

      let extensionsToBuild = this.r.find(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });

      let builtExtensions = this.r.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });

      let allExtensions = builtExtensions.length + extensionsToBuild.length;

      if (allExtensions < extensionCount) {
        let mainSpawn = this.r.find(FIND_MY_SPAWNS)[0];
        let initialPos = this.r.getPositionAt(mainSpawn.pos.x, mainSpawn.pos.y + 1);
        if (allExtensions < 1 && initialPos) {
          this.r.createConstructionSite(initialPos, STRUCTURE_EXTENSION);
        }

        for (let i = allExtensions - 1; i < extensionCount; i++) {
          if (i % 2 === 0) {
            let targetPos = this.r.getPositionAt(
              extensionsToBuild[i].pos.x - 1,
              extensionsToBuild[i].pos.y
            );
            if (targetPos) {
              this.r.createConstructionSite(targetPos, STRUCTURE_EXTENSION);
            }
          } else {
            let targetPos = this.r.getPositionAt(
              extensionsToBuild[i].pos.x,
              extensionsToBuild[i].pos.y - 1
            );
            if (targetPos) {
              this.r.createConstructionSite(targetPos, STRUCTURE_EXTENSION);
            }
          }
        }
      }
    }
  }

  // Build structures in room positions
  buildRoomPositions(): void {
    if (
      this.roomController &&
      this.roomController.level > 1 &&
      !this.r.memory.roomBaseConstructed
    ) {
      Object.keys(this.roomPositions).forEach((struct) => {
        for (const pos of this.roomPositions[struct as keyof typeof this.roomPositions]) {
          if (pos.built === false) {
            pos.built = this.matrixedCSite(pos.x, pos.y, struct as BuildableStructureConstant);
          }
        }
      });
      //reset costmatrix memory
      this.roomCostMaxtrix.reset();
      this.r.memory.roomBaseConstructed = true;
      // TODO implement a retry to build the failed structures
    }
  }

  matrixedCSite(x: number, y: number, structureType: BuildableStructureConstant): boolean {
    let returnValue = false;
    if (this.roomCostMaxtrix.get(x, y) != 255) {
      let result = this.r.createConstructionSite(x, y, structureType);
      if (result === OK) {
        returnValue = true;
      }
    } else {
      console.log(`CostMatrix error: failed to build ${structureType} at ${x},${y}`);
    }
    return returnValue;
  }

  createSourceStructures() {
    if (this.roomController && this.roomController.level > 1) {
      let spawn = this.r.find(FIND_MY_SPAWNS)[0];
      let initialPos = this.r.getPositionAt(spawn.pos.x, spawn.pos.y);
      let sources = this.roomSources;
      for (let source of sources) {
        if (!this.r.memory.sourcesMapped) {
          this.r.memory.sourcesMapped = [];
        }

        if (this.r.memory.sourcesMapped.indexOf(source.id) === -1 && initialPos) {
          let path = this.r.findPath(initialPos, source.pos, {
            maxOps: 100,
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            swampCost: 1,
          });
          if (path.length > 0) {
            for (let i = 0; i < path.length - 2; i++) {
              this.matrixedCSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
          }
          this.matrixedCSite(path[path.length - 2].x, path[path.length - 2].y, STRUCTURE_CONTAINER);

          this.r.memory.sourcesMapped.push(source.id);
          this.roomCostMaxtrix.reset();
        }
      }
    }
  }

  // sort construction site array by structure type
  sortConstructionSites(): void {
    let sortedSites: ConstructionSite[] = [];
    let sites = this.myConstructionSites;
    for (const site of sites) {
      if (site.structureType == STRUCTURE_EXTENSION) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_SPAWN) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_TOWER) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_CONTAINER) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_STORAGE) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_ROAD) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_WALL) {
        sortedSites.push(site);
      } else if (site.structureType == STRUCTURE_RAMPART) {
        sortedSites.push(site);
      }
    }
    this.myConstructionSites = sortedSites;
  }
}
