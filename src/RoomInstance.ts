import { SpawnerInstance } from "SpawnerInstance";
import { CreepsInstance } from "CreepsInstance";
import { roleHarvester } from "role.harvester";
import { roleUpgrader } from "role.upgrader";
import { roleBuilder } from "role.builder";


export class RoomInstance {

    room: Room;
    roomController: StructureController | undefined;
    roomEnergyAvailable: number;
    roomEnergyCapacityAvailable: number;
    roomStorage: StructureStorage | undefined;
    roomSpawner: SpawnerInstance;
    roomSources: Source[];
    roomMyConstructionSites: ConstructionSite[];
    roomMyCreeps: CreepsInstance;

    // constructor
    constructor(room: Room) {
        this.room = room;
        this.roomController = room.controller && room.controller.my ? room.controller : undefined;
        this.roomEnergyAvailable = room.energyAvailable;
        this.roomEnergyCapacityAvailable = room.energyCapacityAvailable;
        this.roomStorage = room.storage && room.storage.my ? room.storage : undefined;
        this.roomSpawner = new SpawnerInstance(room);
        this.roomSources = room.find(FIND_SOURCES);
        this.roomMyCreeps = new CreepsInstance(room);
        room.find(FIND_MY_CREEPS);
        this.roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        // roomTerminal = room.terminal;
        // roomStructures = room.find(FIND_STRUCTURES);
        // roomHostiles = room.find(FIND_HOSTILE_CREEPS);
        // roomMyStructures = room.find(FIND_MY_STRUCTURES);
        // roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    }
    
    run() {


        // Spawn new harvester if needed
  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  if(harvesters.length < 2) {
      var newName = 'Harvester' + Game.time;
      console.log('Spawning new harvester: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
          {memory: {role: 'harvester', working: false, room: Game.spawns['Spawn1'].room.name}});
  }

// Spawn new upgrader if needed
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  if(upgraders.length < 1) {
      var newName = 'Upgrader' + Game.time;
      console.log('Spawning new upgrader: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
          {memory: {role: 'upgrader', working: false, room: Game.spawns['Spawn1'].room.name}});
  }

  // Spawn new builder if needed
  var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  if(builders.length < 1) {
      var newName = 'Builder' + Game.time;
      console.log('Spawning new builder: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
          {memory: {role: 'builder', working: false, room: Game.spawns['Spawn1'].room.name}});
  }
  
        this.roomSpawner.run();
        this.roomMyCreeps.run();
        // this.roomTerminal.run();
        // this.roomStructures.run();
        // this.roomHostiles.run();
        // this.roomMyStructures.run();
        // this.roomMyConstructionSites.run();

    }
    
}




