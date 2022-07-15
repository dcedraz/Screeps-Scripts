import { CostMatrix } from "utils/CostMatrix";
import { HelperFunctions } from "utils/HelperFunctions";

export class StructuresInstance {
  constructor(
    public r: Room,
    public roomSources: Source[],
    public roomController: StructureController | undefined = r.controller,
    public myConstructionSites: ConstructionSite[] = r.find(FIND_CONSTRUCTION_SITES),
    public roomCostMaxtrix: CostMatrix = new CostMatrix(r),
    public roomPositions = {
      spawns: Array<RoomPosition>(),
      extensions: Array<RoomPosition>(),
      containers: Array<RoomPosition>(),
      towers: Array<RoomPosition>(),
      links: Array<RoomPosition>(),
      storage: Array<RoomPosition>(),
      roads: Array<RoomPosition>(),
      walls: Array<RoomPosition>(),
      ramparts: Array<RoomPosition>(),
    }
  ) {
    this.sortConstructionSites();
    this.createExtensions();
    this.createSourceStructures();
    this.runMemoized();
  }

  runMemoized(): void {
    const memoizedcalcRoomPositions = HelperFunctions.memoizeRoomPositions(
      this.calcRoomPositions.bind(this),
      this.r
    );
    this.roomPositions = memoizedcalcRoomPositions(this.r.name);
    this.createVisuals();
  }

  calcRoomPositions(): Object {
    console.log(`Calculating room positions for ${this.r.name}`);
    // Calculate Spawn positions
    const initialSpawn = this.r.find(FIND_MY_SPAWNS)[0];
    const initialX = initialSpawn.pos.x;
    const initialY = initialSpawn.pos.y;
    const initialSpawnPos = this.r.getPositionAt(initialX, initialY);
    const secondSpawnPos = this.r.getPositionAt(initialX + 3, initialY);
    const thirdSpawnPos = this.r.getPositionAt(initialX - 3, initialY);
    if (initialSpawnPos) {
      this.roomPositions.spawns.push(initialSpawnPos);
    }
    if (secondSpawnPos) {
      this.roomPositions.spawns.push(secondSpawnPos);
    }
    if (thirdSpawnPos) {
      this.roomPositions.spawns.push(thirdSpawnPos);
    }

    // Calculate Storage position
    const storagePos = this.r.getPositionAt(initialX, initialY - 3);
    if (storagePos) {
      this.roomPositions.storage.push(storagePos);
    }

    // Calculate Links positions
    const firstLinkPos = this.r.getPositionAt(initialX, initialY + 3);
    if (firstLinkPos) {
      this.roomPositions.links.push(firstLinkPos);
    }

    // Calculate Towers positions
    const firstTowerPos = this.r.getPositionAt(initialX + 1, initialY + 1);
    const secondTowerPos = this.r.getPositionAt(initialX - 1, initialY + 1);
    const thirdTowerPos = this.r.getPositionAt(initialX + 1, initialY - 1);
    const fourthTowerPos = this.r.getPositionAt(initialX - 1, initialY - 1);
    if (firstTowerPos) {
      this.roomPositions.towers.push(firstTowerPos);
    }
    if (secondTowerPos) {
      this.roomPositions.towers.push(secondTowerPos);
    }
    if (thirdTowerPos) {
      this.roomPositions.towers.push(thirdTowerPos);
    }
    if (fourthTowerPos) {
      this.roomPositions.towers.push(fourthTowerPos);
    }

    // Calculate Extension positions
    const firstExtensionPos = this.r.getPositionAt(initialX + 2, initialY + 1);
    const secondExtensionPos = this.r.getPositionAt(initialX - 2, initialY + 1);
    const thirdExtensionPos = this.r.getPositionAt(initialX + 2, initialY - 1);
    const fourthExtensionPos = this.r.getPositionAt(initialX - 2, initialY - 1);
    const fifthExtensionPos = this.r.getPositionAt(initialX + 1, initialY + 2);
    const sixthExtensionPos = this.r.getPositionAt(initialX - 1, initialY + 2);
    const seventhExtensionPos = this.r.getPositionAt(initialX + 1, initialY - 2);
    const eighthExtensionPos = this.r.getPositionAt(initialX - 1, initialY - 2);
    const ninthExtensionPos = this.r.getPositionAt(initialX + 2, initialY + 2);
    const tenthExtensionPos = this.r.getPositionAt(initialX - 2, initialY + 2);
    const eleventhExtensionPos = this.r.getPositionAt(initialX + 2, initialY - 2);
    const twelfthExtensionPos = this.r.getPositionAt(initialX - 2, initialY - 2);
    if (firstExtensionPos) {
      this.roomPositions.extensions.push(firstExtensionPos);
    }
    if (secondExtensionPos) {
      this.roomPositions.extensions.push(secondExtensionPos);
    }
    if (thirdExtensionPos) {
      this.roomPositions.extensions.push(thirdExtensionPos);
    }
    if (fourthExtensionPos) {
      this.roomPositions.extensions.push(fourthExtensionPos);
    }
    if (fifthExtensionPos) {
      this.roomPositions.extensions.push(fifthExtensionPos);
    }
    if (sixthExtensionPos) {
      this.roomPositions.extensions.push(sixthExtensionPos);
    }
    if (seventhExtensionPos) {
      this.roomPositions.extensions.push(seventhExtensionPos);
    }
    if (eighthExtensionPos) {
      this.roomPositions.extensions.push(eighthExtensionPos);
    }
    if (ninthExtensionPos) {
      this.roomPositions.extensions.push(ninthExtensionPos);
    }
    if (tenthExtensionPos) {
      this.roomPositions.extensions.push(tenthExtensionPos);
    }
    if (eleventhExtensionPos) {
      this.roomPositions.extensions.push(eleventhExtensionPos);
    }
    if (twelfthExtensionPos) {
      this.roomPositions.extensions.push(twelfthExtensionPos);
    }

    // Calculate Rodas positions
    this.calcRoadsAroundStructures(this.roomPositions.spawns);
    this.calcRoadsAroundStructures(this.roomPositions.storage);
    this.calcRoadsAroundStructures(this.roomPositions.links);

    return this.roomPositions;
  }

  // Calculate Roads around structures
  calcRoadsAroundStructures(structures: RoomPosition[]) {
    for (const pos of structures) {
      let x = pos.x;
      let y = pos.y;
      for (let i = 1; i < 2; i++) {
        let roadPos = this.r.getPositionAt(x + i, y);
        if (roadPos) {
          this.roomPositions.roads.push(roadPos);
        }
        roadPos = this.r.getPositionAt(x - i, y);
        if (roadPos) {
          this.roomPositions.roads.push(roadPos);
        }
        roadPos = this.r.getPositionAt(x, y + i);
        if (roadPos) {
          this.roomPositions.roads.push(roadPos);
        }
        roadPos = this.r.getPositionAt(x, y - i);
        if (roadPos) {
          this.roomPositions.roads.push(roadPos);
        }
      }
    }
  }

  // Create visuals for roomPostiions
  createVisuals(): void {
    for (const pos of this.roomPositions.spawns) {
      this.r.visual.text("Spawn", pos, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.storage) {
      this.r.visual.text("Storage", pos, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.links) {
      this.r.visual.text("Link", pos, {
        color: "#ff0000",
        font: 0.5,
      });
    }
    for (const pos of this.roomPositions.towers) {
      this.r.visual.text("Tower", pos, {
        color: "#ff0000",
        font: 0.5,
      });
      //pos.createFlag(`Tower${pos.x + pos.y}`);
    }
    for (const pos of this.roomPositions.roads) {
      Game.rooms[this.r.name].visual.circle(pos.x, pos.y, {
        fill: "blue",
        radius: 0.1,
      });
    }
    for (const pos of this.roomPositions.extensions) {
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
        this.r.memory.baseLayoutCalculated = false;
      }
    }
  }

  createSourceStructures() {
    if (this.roomController && this.roomController.level > 1) {
      let spawns = this.r.find(FIND_MY_SPAWNS);
      let sources = this.roomSources;

      for (let spawn of spawns) {
        for (let source of sources) {
          if (!this.r.memory.sourcesMapped) {
            this.r.memory.sourcesMapped = [];
          }

          if (this.r.memory.sourcesMapped.indexOf(source.id) === -1) {
            let path = this.r.findPath(spawn.pos, source.pos, {
              maxOps: 100,
              ignoreCreeps: true,
              ignoreDestructibleStructures: true,
              swampCost: 1,
            });
            if (path.length > 0) {
              for (let i = 0; i < path.length - 2; i++) {
                this.r.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
              }
            }
            this.r.createConstructionSite(
              path[path.length - 2].x,
              path[path.length - 2].y,
              STRUCTURE_CONTAINER
            );

            this.r.memory.sourcesMapped.push(source.id);
            this.r.memory.baseLayoutCalculated = false;
          }
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
