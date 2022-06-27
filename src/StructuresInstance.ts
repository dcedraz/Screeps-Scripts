export class StructuresInstance {
  constructor(
    public room: Room,
    public roomSources: Source[],
    public roomController: StructureController | undefined = room.controller,
    public myConstructionSites: ConstructionSite[] = room.find(FIND_CONSTRUCTION_SITES)
  ) {}

  createExtensions(): void {
    if (this.roomController && this.roomController.level > 1) {
      let extensionCount = CONTROLLER_STRUCTURES.extension[this.roomController.level];

      let extensionsToBuild = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });

      let builtExtensions = this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      });

      let allExtensions = builtExtensions.length + extensionsToBuild.length;

      if (allExtensions < extensionCount) {
        let mainSpawn = this.room.find(FIND_MY_SPAWNS)[0];
        let initialPos = this.room.getPositionAt(mainSpawn.pos.x, mainSpawn.pos.y + 1);
        if (allExtensions < 1 && initialPos) {
          this.room.createConstructionSite(initialPos, STRUCTURE_EXTENSION);
        }

        for (let i = allExtensions - 1; i < extensionCount; i++) {
          if (i % 2 === 0) {
            let targetPos = this.room.getPositionAt(
              extensionsToBuild[i].pos.x - 1,
              extensionsToBuild[i].pos.y
            );
            if (targetPos) {
              this.room.createConstructionSite(targetPos, STRUCTURE_EXTENSION);
            }
          } else {
            let targetPos = this.room.getPositionAt(
              extensionsToBuild[i].pos.x,
              extensionsToBuild[i].pos.y - 1
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

  run() {
    this.sortConstructionSites();
    this.createExtensions();
    this.createSourceStructures();
  }
}
