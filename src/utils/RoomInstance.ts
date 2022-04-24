export class RoomInstance {

    room: Room;
    roomController: any;
    roomEnergyAvailable: number;
    roomEnergyCapacityAvailable: number;
    roomStorage: any;
    roomSpawns: StructureSpawn[];
    roomSources: Source[];
    roomMyConstructionSites: ConstructionSite[];

    // constructor
    constructor(room: Room) {
        this.room = room;
        this.roomController = room.controller && room.controller.my ? room.controller : undefined;
        this.roomEnergyAvailable = room.energyAvailable;
        this.roomEnergyCapacityAvailable = room.energyCapacityAvailable;
        this.roomStorage = room.storage && room.storage.my ? room.storage : undefined;
        this.roomSpawns = room.find(FIND_MY_SPAWNS);
        this.roomSources = room.find(FIND_SOURCES);
        this.roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        // roomTerminal = room.terminal;
        // roomStructures = room.find(FIND_STRUCTURES);
        // roomHostiles = room.find(FIND_HOSTILE_CREEPS);
        // roomMyCreeps = room.find(FIND_MY_CREEPS);
        // roomMyStructures = room.find(FIND_MY_STRUCTURES);
        // roomMyConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    }        
    
}
