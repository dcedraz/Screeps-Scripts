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

Object.defineProperties(Room.prototype, {
  sources: {
    get() {
      if (this._sources) return this._sources;

      if (!this.memory.sourceIds) {
        this.memory.sourceIds = [];

        for (const source of this.find(FIND_SOURCES)) this.memory.sourceIds.push(source.id);
      }

      this._sources = [];

      for (const sourceId of this.memory.sourceIds)
        this._sources.push(HelperFunctions.findObjectWithID(sourceId) as any);

      return this._sources;
    },
  },
  mineral: {
    get() {
      if (this._mineral) return this._mineral;

      return (this._mineral = this.find(FIND_MINERALS)[0]);
    },
  },
  myCreeps: {
    get() {
      if (this._myCreeps) return this._myCreeps;

      return (this._myCreeps = this.find(FIND_MY_CREEPS));
    },
  },
  enemyCreeps: {
    get() {
      if (this._enemyCreeps) return this._enemyCreeps;

      return (this._enemyCreeps = this.find(FIND_HOSTILE_CREEPS));
    },
  },
  structures: {
    get() {
      if (this._structures) return this._structures;

      // Construct storage of structures based on structureType

      this._structures = {} as any;

      // Make array keys for each structureType

      for (const structureType of allStructureTypes) this._structures[structureType] = [];

      // Group structures by structureType

      for (const structure of this.find(FIND_STRUCTURES))
        this._structures[structure.structureType].push(structure as any);

      return this._structures;
    },
  },
  cSitesGrouped: {
    get() {
      if (this._cSitesGrouped) return this._cSitesGrouped;

      // Construct storage of structures based on structureType

      this._cSitesGrouped = {} as any;

      // Make array keys for each structureType

      for (const structureType of allStructureTypes) this._cSitesGrouped[structureType] = [];

      // Group cSites by structureType

      for (const cSite of this.find(FIND_MY_CONSTRUCTION_SITES))
        this._cSitesGrouped[cSite.structureType].push(cSite);

      return this._cSitesGrouped;
    },
  },
  cSites: {
    get() {
      if (this._cSites) return this._cSites;

      return (this._cSites = this.find(FIND_MY_CONSTRUCTION_SITES));
    },
  },
  droppedEnergy: {
    get() {
      if (this._droppedEnergy) return this._droppedEnergy;

      return (this._droppedEnergy = this.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => resource.resourceType === RESOURCE_ENERGY,
      }));
    },
  },
} as PropertyDescriptorMap & ThisType<Room>);
