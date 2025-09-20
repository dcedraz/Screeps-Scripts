# CreepsInstance and Creep Roles Refactoring Plan

## Overview
Refactor `CreepsInstance` class and creep role classes to functional programming approach, following the established pattern from `SpawnerInstance` and `RoomInstance` refactoring.

## Current State Analysis

### CreepsInstance Class
- **Current:** Class-based with constructor parameters and methods
- **Key Responsibilities:**
  - Filter creeps by role (harvesters, haulers, upgraders, builders)
  - Define creep body configurations
  - Create new creep spawn orders
  - Run creep logic by delegating to role classes
  - Utility functions (walkOverRoad)

### Creep Role Classes
- **Current:** Class-based roles (`RoleHarvester`, `RoleHauler`, `RoleBuilder`, `RoleUpgrader`)
- **Pattern:** Each role has constructor taking creep and a `run()` method
- **Dependencies:** Role classes are instantiated in `CreepsInstance.run()`

## Refactoring Plan

### Phase 1: Define Functional Interface and Types

#### 1.1 Create CreepsInstance Interface
```typescript
export interface CreepsInstance {
  room: Room;
  creeps: Creep[];
  harvesters: Creep[];
  haulers: Creep[];
  upgraders: Creep[];
  builders: Creep[];
  creepBodies: CreepBodiesConfig;
}

export interface CreepBodiesConfig {
  harvesters: BodyPartConstant[];
  haulers: BodyPartConstant[];
  upgraders: BodyPartConstant[];
  builders: BodyPartConstant[];
}
```

#### 1.2 Define Factory Function
```typescript
export function createCreepsInstance(room: Room): CreepsInstance
```

#### 1.3 Create Creep Role Function Types
```typescript
export type CreepRoleFunction = (creep: Creep) => void;
```

### Phase 2: Refactor CreepsInstance to Functional Approach

#### 2.1 Convert Class Methods to Pure Functions
- `newCreep()` → `createSpawnWorkOrder()`
- `walkOverRoad()` → `moveCreepOverRoad()`
- `run()` → `runCreeps()`

#### 2.2 Extract Creep Filtering Logic
```typescript
export function filterCreepsByRole(creeps: Creep[], role: string): Creep[]
export function getCreepsByRoom(room: Room): Creep[]
```

#### 2.3 Body Configuration Management
```typescript
export function getDefaultCreepBodies(): CreepBodiesConfig
export function getCreepBodyForRole(role: string, bodiesConfig: CreepBodiesConfig): BodyPartConstant[]
```

### Phase 3: Refactor Creep Roles to Functional Approach

#### 3.1 Convert Role Classes to Functions
- `RoleHarvester` → `runHarvesterRole(creep: Creep): void`
- `RoleHauler` → `runHaulerRole(creep: Creep): void`
- `RoleUpgrader` → `runUpgraderRole(creep: Creep): void`
- `RoleBuilder` → `runBuilderRole(creep: Creep): void`

#### 3.2 Create Role Function Registry
```typescript
export const CREEP_ROLE_FUNCTIONS: Record<string, CreepRoleFunction> = {
  harvester: runHarvesterRole,
  hauler: runHaulerRole,
  upgrader: runUpgraderRole,
  builder: runBuilderRole,
};
```

#### 3.3 Generic Role Runner
```typescript
export function runCreepRole(creep: Creep): void
export function runCreepsWithRole(creeps: Creep[], role: string): void
```

### Phase 4: Update Integration Points

#### 4.1 Update RoomInstance Integration
- Modify `RoomInstance.ts` to use new functional `CreepsInstance`
- Update `createRoomInstance()` to use `createCreepsInstance()`
- Update `runRoom()` to use `runCreeps()`

#### 4.2 Update Spawn Logic Integration
- Modify spawn functions in `RoomInstance.ts` to use new `createSpawnWorkOrder()`
- Ensure compatibility with existing `SpawnerInstance` functions

## Implementation Strategy

### TDD Approach
1. **Red:** Write failing tests for each new function
2. **Green:** Implement minimal code to pass tests
3. **Refactor:** Clean up implementation while keeping tests green

### Test Migration Plan
1. Update existing `CreepsInstance.spec.ts` to test new functional interface
2. Create new test files for role functions: `CreepRoles.spec.ts`
3. Ensure all existing functionality is covered by tests
4. Test integration points with `RoomInstance` and `SpawnerInstance`

### Implementation Order
1. **Phase 1:** Define interfaces and types (structural change)
2. **Phase 2:** Implement `CreepsInstance` functional approach with tests
3. **Phase 3:** Refactor role classes to functions with tests
4. **Phase 4:** Update integration points and run full test suite

## Benefits of Functional Approach

### Testability
- Pure functions easier to test in isolation
- No need to mock class constructors
- Clear input/output relationships

### Performance
- No object instantiation overhead for role classes
- More efficient creep processing
- Better memory usage patterns

### Maintainability
- Clearer separation of concerns
- Easier to add new roles
- More predictable data flow

## Risk Mitigation

### Compatibility
- Maintain same public interface during transition
- Use feature flags if needed for gradual rollout
- Ensure all existing tests pass after refactoring

### Performance
- Profile before/after refactoring
- Monitor memory usage in Screeps environment
- Validate CPU usage remains acceptable

## Files to be Modified/Created

### Modified Files
- `src/CreepsInstance.ts` - Convert to functional approach
- `src/RoomInstance.ts` - Update integration
- `test/src/RoomInstance.spec.ts` - Update tests for integration changes

### New Files
- `src/creep_roles/CreepRoleFunctions.ts` - New functional role implementations
- `test/src/CreepsInstance.spec.ts` - Updated tests for functional approach
- `test/src/CreepRoleFunctions.spec.ts` - Tests for role functions

### Removed Files (after transition)
- `src/creep_roles/RoleHarvester.ts`
- `src/creep_roles/RoleHauler.ts`
- `src/creep_roles/RoleBuilder.ts`
- `src/creep_roles/RoleUpgrader.ts`

## Success Criteria
- [ ] All existing tests pass
- [ ] New functional implementation provides same behavior
- [ ] Performance is maintained or improved
- [ ] Code is more maintainable and testable
- [ ] Integration with other functional components works seamlessly
