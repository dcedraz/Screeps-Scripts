import { HelperFunctions } from "utils/HelperFunctions";
export const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep: Creep) {
	    if(creep.store.getFreeCapacity() > 0) {
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        return (
                            HelperFunctions.isExtension(structure) ||
                            HelperFunctions.isTower(structure) ||
                            HelperFunctions.isSpawn(structure)
                            ) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

	}
};