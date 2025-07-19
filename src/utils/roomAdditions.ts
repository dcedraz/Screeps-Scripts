import { HelperFunctions } from "./HelperFunctions";

const allStructureTypes = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION,
  STRUCTURE_ROAD,
  STRUCTURE_WALL,
  STRUCTURE_RAMPART,
  STRUCTURE_KEEPER_LAIR,
  STRUCTURE_PORTAL,
  STRUCTURE_CONTROLLER,
  STRUCTURE_LINK,
  STRUCTURE_STORAGE,
  STRUCTURE_TOWER,
  STRUCTURE_OBSERVER,
  STRUCTURE_POWER_BANK,
  STRUCTURE_POWER_SPAWN,
  STRUCTURE_EXTRACTOR,
  STRUCTURE_LAB,
  STRUCTURE_TERMINAL,
  STRUCTURE_CONTAINER,
  STRUCTURE_NUKER,
  STRUCTURE_FACTORY,
  STRUCTURE_INVADER_CORE,
];

// Guard all prototype extensions to avoid redefining on module reloads
type RoomWithCache = Room & {
  _sources?: Source[];
  _mineral?: Mineral;
  _myCreeps?: Creep[];
  _enemyCreeps?: Creep[];
  _structures?: { [type: string]: Structure[] };
  _cSitesGrouped?: { [type: string]: ConstructionSite[] };
  _cSites?: ConstructionSite[];
  _droppedEnergy?: Resource[];
};
const roomProto = Room.prototype as RoomWithCache;
if (!Object.getOwnPropertyDescriptor(roomProto, "sources")) {
  Object.defineProperty(roomProto, "sources", {
    get() {
      if (this._sources) return this._sources;
      if (!this.memory.sourceIds) {
        this.memory.sourceIds = [];
        for (const source of this.find(FIND_SOURCES)) this.memory.sourceIds.push(source.id);
      }
      this._sources = [];
      for (const sourceId of this.memory.sourceIds)
        this._sources.push(HelperFunctions.findObjectWithID(sourceId) as Source);
      return this._sources;
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "mineral")) {
  Object.defineProperty(roomProto, "mineral", {
    get() {
      if (this._mineral) return this._mineral;
      return (this._mineral = this.find(FIND_MINERALS)[0]);
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "myCreeps")) {
  Object.defineProperty(roomProto, "myCreeps", {
    get() {
      if (this._myCreeps) return this._myCreeps;
      return (this._myCreeps = this.find(FIND_MY_CREEPS));
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "enemyCreeps")) {
  Object.defineProperty(roomProto, "enemyCreeps", {
    get() {
      if (this._enemyCreeps) return this._enemyCreeps;
      return (this._enemyCreeps = this.find(FIND_HOSTILE_CREEPS));
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "structures")) {
  Object.defineProperty(roomProto, "structures", {
    get() {
      if (this._structures) return this._structures;
      this._structures = {};
      for (const structureType of allStructureTypes) this._structures[structureType] = [];
      for (const structure of this.find(FIND_STRUCTURES))
        this._structures[structure.structureType].push(structure);
      return this._structures;
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "cSitesGrouped")) {
  Object.defineProperty(roomProto, "cSitesGrouped", {
    get() {
      if (this._cSitesGrouped) return this._cSitesGrouped;
      this._cSitesGrouped = {};
      for (const structureType of allStructureTypes) this._cSitesGrouped[structureType] = [];
      for (const cSite of this.find(FIND_MY_CONSTRUCTION_SITES))
        this._cSitesGrouped[cSite.structureType].push(cSite);
      return this._cSitesGrouped;
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "cSites")) {
  Object.defineProperty(roomProto, "cSites", {
    get() {
      if (this._cSites) return this._cSites;
      return (this._cSites = this.find(FIND_MY_CONSTRUCTION_SITES));
    },
    configurable: true,
  });
}
if (!Object.getOwnPropertyDescriptor(roomProto, "droppedEnergy")) {
  Object.defineProperty(roomProto, "droppedEnergy", {
    get() {
      if (this._droppedEnergy) return this._droppedEnergy;
      return (this._droppedEnergy = this.find(FIND_DROPPED_RESOURCES, {
        filter: (resource: Resource) => resource.resourceType === RESOURCE_ENERGY,
      }));
    },
    configurable: true,
  });
}
