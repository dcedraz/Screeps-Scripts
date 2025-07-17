import { mockInstanceOf } from 'screeps-jest';
import { CreepsInstance } from '../../src/CreepsInstance';
import { RoleHarvester } from '../../src/creep_roles/RoleHarvester';
import { RoleHauler } from '../../src/creep_roles/RoleHauler';
import { RoleUpgrader } from '../../src/creep_roles/RoleUpgrader';
import { RoleBuilder } from '../../src/creep_roles/RoleBuilder';

jest.mock('../../src/creep_roles/RoleHarvester');
jest.mock('../../src/creep_roles/RoleHauler');
jest.mock('../../src/creep_roles/RoleUpgrader');
jest.mock('../../src/creep_roles/RoleBuilder');

describe('CreepsInstance', () => {
  const room = mockInstanceOf<Room>({ name: 'W1N1' });

  it('runs RoleHarvester.runInitial for harvesters', () => {
    const creep = mockInstanceOf<Creep>({ memory: { role: 'harvester' } });
    const creeps = [creep];
    const instance = new CreepsInstance(room, creeps);
    instance.run();
    expect(RoleHarvester).toHaveBeenCalledWith(creep);
    expect(RoleHarvester.prototype.runInitial).toHaveBeenCalled();
  });

  it('runs RoleHauler.run for haulers', () => {
    const creep = mockInstanceOf<Creep>({ memory: { role: 'hauler' } });
    const creeps = [creep];
    const instance = new CreepsInstance(room, creeps);
    instance.run();
    expect(RoleHauler).toHaveBeenCalledWith(creep);
    expect(RoleHauler.prototype.run).toHaveBeenCalled();
  });

  it('runs RoleUpgrader.run for upgraders', () => {
    const creep = mockInstanceOf<Creep>({ memory: { role: 'upgrader' } });
    const creeps = [creep];
    const instance = new CreepsInstance(room, creeps);
    instance.run();
    expect(RoleUpgrader).toHaveBeenCalledWith(creep);
    expect(RoleUpgrader.prototype.run).toHaveBeenCalled();
  });

  it('runs RoleBuilder.run for builders', () => {
    const creep = mockInstanceOf<Creep>({ memory: { role: 'builder' } });
    const creeps = [creep];
    const instance = new CreepsInstance(room, creeps);
    instance.run();
    expect(RoleBuilder).toHaveBeenCalledWith(creep);
    expect(RoleBuilder.prototype.run).toHaveBeenCalled();
  });
});
