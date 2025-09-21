
import { HelperFunctions } from '../../../src/utils/HelperFunctions';
const { mockGlobal } = require('screeps-jest');

describe('HelperFunctions', () => {
  beforeAll(() => {
    mockGlobal('Game', {
      getObjectById: jest.fn()
    });
  });
  describe('type guards', () => {
    it('isTower returns true for tower', () => {
      expect(HelperFunctions.isTower({ structureType: STRUCTURE_TOWER } as any)).toBe(true);
      expect(HelperFunctions.isTower({ structureType: STRUCTURE_CONTAINER } as any)).toBe(false);
    });
    it('isContainer returns true for container', () => {
      expect(HelperFunctions.isContainer({ structureType: STRUCTURE_CONTAINER } as any)).toBe(true);
      expect(HelperFunctions.isContainer({ structureType: STRUCTURE_TOWER } as any)).toBe(false);
    });
    it('isExtension returns true for extension', () => {
      expect(HelperFunctions.isExtension({ structureType: STRUCTURE_EXTENSION } as any)).toBe(true);
      expect(HelperFunctions.isExtension({ structureType: STRUCTURE_TOWER } as any)).toBe(false);
    });
    it('isSpawn returns true for spawn', () => {
      expect(HelperFunctions.isSpawn({ structureType: STRUCTURE_SPAWN } as any)).toBe(true);
      expect(HelperFunctions.isSpawn({ structureType: STRUCTURE_TOWER } as any)).toBe(false);
    });
    it('isStorage returns true for storage', () => {
      expect(HelperFunctions.isStorage({ structureType: STRUCTURE_STORAGE } as any)).toBe(true);
      expect(HelperFunctions.isStorage({ structureType: STRUCTURE_TOWER } as any)).toBe(false);
    });
    it('isController returns true for controller', () => {
      expect(HelperFunctions.isController({ structureType: STRUCTURE_CONTROLLER } as any)).toBe(true);
      expect(HelperFunctions.isController({ structureType: STRUCTURE_TOWER } as any)).toBe(false);
    });
  });

  describe('printObjectById and printObject', () => {
    it('calls console.log with stringified object', () => {
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const getObjectByIdSpy = jest.spyOn(Game, 'getObjectById').mockReturnValue({ foo: 'bar' } as any);
      HelperFunctions.printObjectById('id' as Id<any>);
      expect(log).toHaveBeenCalledWith(JSON.stringify({ foo: 'bar' }, undefined, 4));
      HelperFunctions.printObject({ bar: 'baz' });
      expect(log).toHaveBeenCalledWith(JSON.stringify({ bar: 'baz' }, undefined, 4));
      log.mockRestore();
      getObjectByIdSpy.mockRestore();
    });
  });

  describe('findCarryPartsRequired', () => {
    it('calculates carry parts required', () => {
      expect(HelperFunctions.findCarryPartsRequired(10, 50)).toBe((10 * 2 * 50) / CARRY_CAPACITY);
    });
  });

  describe('findObjectWithID', () => {
    it('returns object from Game.getObjectById', () => {
      const obj = { id: 'id' };
      const getObjectByIdSpy = jest.spyOn(Game, 'getObjectById').mockReturnValue(obj as any);
      expect(HelperFunctions.findObjectWithID('id' as Id<any>)).toBe(obj);
      getObjectByIdSpy.mockReturnValue(null);
      expect(HelperFunctions.findObjectWithID('id' as Id<any>)).toBeUndefined();
      getObjectByIdSpy.mockRestore();
    });
  });

  describe('isHostileNearby', () => {
    it('returns true if hostile creeps found', () => {
      const structure = { pos: { findInRange: jest.fn(() => [{}]) } };
      expect(HelperFunctions.isHostileNearby(structure)).toBe(true);
    });
    it('returns false if no hostile creeps', () => {
      const structure = { pos: { findInRange: jest.fn(() => []) } };
      expect(HelperFunctions.isHostileNearby(structure)).toBe(false);
    });
  });

  describe('isCreepNearby', () => {
    it('returns true if my creeps found', () => {
      const structure = { pos: { findInRange: jest.fn(() => [{}]) } };
      expect(HelperFunctions.isCreepNearby(structure)).toBe(true);
    });
    it('returns false if no my creeps', () => {
      const structure = { pos: { findInRange: jest.fn(() => []) } };
      expect(HelperFunctions.isCreepNearby(structure)).toBe(false);
    });
  });

  describe('emptyBaseStructures', () => {
    it('returns an object with all structure arrays', () => {
      const result = HelperFunctions.emptyBaseStructures();
      expect(result).toEqual(
        expect.objectContaining({
          spawn: expect.any(Array),
          storage: expect.any(Array),
          link: expect.any(Array),
          container: expect.any(Array),
          tower: expect.any(Array),
          road: expect.any(Array),
          extension: expect.any(Array),
          wall: expect.any(Array),
          rampart: expect.any(Array),
        })
      );
    });
  });

  describe('getGreatestEnergyDrop', () => {
    it('returns the resource with the greatest amount', () => {
      const r = { droppedEnergy: [
        { amount: 10 },
        { amount: 50 },
        { amount: 30 },
      ] } as any;
      expect(HelperFunctions.getGreatestEnergyDrop(r)).toEqual({ amount: 50 });
    });
  });

  describe('getRoomStructuresArray', () => {
    it('flattens all structure arrays in r.structures', () => {
      const r = { structures: { spawn: [1], tower: [2, 3], road: [] } } as any;
      expect(HelperFunctions.getRoomStructuresArray(r)).toEqual([1, 2, 3]);
    });
  });
});
