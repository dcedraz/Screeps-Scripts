# StructuresInstance and CostMatrix Functional Refactoring Plan

## Executive Summary

This document outlines the plan to refactor both `StructuresInstance` and `CostMatrix` classes from object-oriented to functional programming approach, following the pattern already established in other codebase components (`CreepsInstance`, `RoomInstance`, `SpawnerInstance`). The refactoring will be done as a direct replacement without migration phases or backward compatibility concerns.

## Current State Analysis

### StructuresInstance Class Analysis

**Current Usage:**
- Instantiated in `RoomInstance.ts` as `roomStructuresInstance: new StructuresInstance(room, room.sources.filter(...))`
- Used once per room, stored in the `RoomInstance` interface
- Handles room structure planning, position calculation, construction site creation, and visuals

**Key Dependencies:**
- `CostMatrix` class (composition - creates and uses a CostMatrix instance)
- `HelperFunctions.memoizeRoomPositions()` and `HelperFunctions.memoizeCostMatrix()`
- `HelperFunctions.emptyBaseStructures()`
- Room memory for persistence (`r.memory.roomPositions`, `r.memory.sourcesMapped`, `r.memory.source_containers`)

**Core Responsibilities:**
1. Room position calculation and caching (`calcRoomPositions()`)
2. Cost matrix integration for pathfinding validation
3. Construction site creation with matrix validation (`matrixedCSite()`)
4. Visual representation of planned structures
5. Source-specific structure planning (containers, roads)
6. Memory management and reset functionality

### CostMatrix Class Analysis

**Current Usage:**
- Instantiated within `StructuresInstance` constructor as a dependency
- Used for pathfinding cost calculations and position validation
- Integrates with memoization system for performance

**Key Dependencies:**
- `HelperFunctions.memoizeCostMatrix()`
- Room structures, sources, construction sites, and creeps
- Room memory for persistence (`r.memory.roomCostMatrix`)

**Core Responsibilities:**
1. Matrix calculation based on room terrain and objects
2. Serialization/deserialization for memory storage
3. Position cost queries (`get()`, `set()`)
4. Visual debugging support
5. Memory management and reset functionality

## Functional Architecture Design

### Core Principles

1. **Pure Functions**: Functions should not mutate input parameters
2. **Separation of Concerns**: Split calculation, persistence, and side effects
3. **Immutable Data**: Return new objects instead of modifying existing ones
4. **Dependency Injection**: Pass dependencies explicitly rather than creating them internally
5. **Single Responsibility**: Each function should have one clear purpose

### Proposed Structure

#### CostMatrix Functions (utils/costMatrix.ts)

```typescript
// Core data structure
export interface CostMatrixData {
  readonly matrix: ReadonlyArray<number>;
  readonly roomName: string;
}

// Factory function
export function createCostMatrix(room: Room): CostMatrixData

// Pure calculation functions
export function calculateCostMatrix(room: Room): CostMatrixData
export function getCost(matrix: CostMatrixData, x: number, y: number): number
export function setCost(matrix: CostMatrixData, x: number, y: number, cost: number): CostMatrixData

// Serialization functions
export function serializeCostMatrix(matrix: CostMatrixData): string
export function deserializeCostMatrix(serialized: string, roomName: string): CostMatrixData

// Memoization wrapper
export function getMemoizedCostMatrix(room: Room): CostMatrixData

// Visualization function
export function visualizeCostMatrix(room: Room, matrix: CostMatrixData): void

// Reset function
export function resetCostMatrix(room: Room): void
```

#### Structures Functions (structuresInstance.ts)

```typescript
// Core data structure
export interface StructuresData {
  readonly roomName: string;
  readonly roomPositions: BaseStructures;
  readonly roomSources: ReadonlyArray<Source>;
  readonly roomController: StructureController | undefined;
}

// Factory function
export function createStructuresData(room: Room, sources: Source[]): StructuresData

// Pure calculation functions
export function calculateRoomPositions(room: Room, costMatrix: CostMatrixData): BaseStructures
export function checkPositionsForRect(costMatrix: CostMatrixData, room: Room, rect: RectArea): RoomPosition[] | undefined
export function checkPosOnMatrix(costMatrix: CostMatrixData, room: Room, x: number, y: number): RoomPosition | null
export function calculateRoadsAroundStructures(structures: StructPos[]): StructPos[]

// Construction functions
export function createConstructionSite(room: Room, costMatrix: CostMatrixData, x: number, y: number, structureType: BuildableStructureConstant): boolean
export function shouldBuildStructures(roomPositions: BaseStructures): boolean

// Source-specific functions
export function createSourceStructures(room: Room, sources: Source[], costMatrix: CostMatrixData): void

// Memoization wrapper
export function getMemoizedRoomPositions(room: Room): BaseStructures

// Visual functions
export function createStructureVisuals(room: Room, roomPositions: BaseStructures): void

// Side effect functions
export function buildRoomPositions(room: Room, structuresData: StructuresData, costMatrix: CostMatrixData): void
export function runStructuresLogic(room: Room, sources: Source[]): void

// Reset function
export function resetRoomPositions(room: Room): void
```

### Integration with RoomInstance

The `RoomInstance` will be updated to use functional approach:

```typescript
export interface RoomInstance {
  room: Room;
  roomController: StructureController | undefined;
  roomSpawner: SpawnerInstance;
  roomSources: Source[];
  roomStructuresData: StructuresData;  // Changed from roomStructuresInstance
  roomCreeps: CreepsInstance;
}

export function createRoomInstance(room: Room): RoomInstance {
  const sources = room.sources.filter(source => !HelperFunctions.isHostileNearby(source));
  return {
    room,
    roomController: room.controller,
    roomSpawner: createSpawnerInstance(room),
    roomSources: sources,
    roomStructuresData: createStructuresData(room, sources),  // Functional creation
    roomCreeps: createCreepsInstance(room)
  };
}
```

## Implementation Approach

### Direct Replacement Strategy

Since this is a personal project with no production dependencies, we will implement the functional approach as a direct replacement of the existing classes. This allows us to:

1. **Simplify the implementation** by removing compatibility concerns
2. **Focus on clean functional design** without legacy constraints
3. **Reduce implementation complexity** and testing overhead
4. **Achieve immediate benefits** from functional programming patterns

### Core Implementation Steps

1. **Replace CostMatrix class** with functional implementation in `utils/costMatrix.ts`
2. **Replace StructuresInstance class** with functional implementation in `structuresInstance.ts`
3. **Update RoomInstance integration** to use functional structures data
4. **Update all tests** to work with functional implementations
5. **Clean up imports and dependencies** throughout the codebase

## Implementation Details

### Memory Management Strategy

**Current Memory Usage:**
- `room.memory.roomCostMatrix[roomName]` - stores serialized cost matrix
- `room.memory.roomPositions[roomName]` - stores calculated room positions
- `room.memory.sourcesMapped` - tracks processed sources
- `room.memory.source_containers` - tracks container positions per source

**Functional Approach:**
- Maintain same memory structure for compatibility
- Functions will read/write to memory directly
- No instance state - all state in memory or passed as parameters
- Reset functions will clear memory as before

### Memoization Strategy

**Current Approach:**
- Uses `HelperFunctions.memoizeRoomPositions()` and `HelperFunctions.memoizeCostMatrix()`
- Binds class methods for memoization
- Stores results in room memory

**Functional Approach:**
- Create wrapper functions that handle memoization internally
- Pure calculation functions separate from memoized versions
- Maintain same memory-based caching strategy
- Example: `getMemoizedCostMatrix()` wraps `calculateCostMatrix()`

### Error Handling and Validation

**Current State:**
- Limited error handling in class methods
- Some bounds checking in `checkPositionsForRect()`
- Console logging for debugging

**Functional Improvements:**
- Add comprehensive input validation
- Return Result types for error handling where appropriate
- Maintain logging for debugging
- Clear error messages for invalid operations

### Performance Considerations

**Optimization Opportunities:**
- Eliminate object instantiation overhead
- Reduce memory allocation through immutable data structures
- Optimize matrix operations for better cache locality
- Consider lazy evaluation for expensive calculations

**Compatibility Requirements:**
- Maintain same performance characteristics
- Preserve memoization behavior
- Keep same calculation timing and frequency

## Testing Strategy

### Testing Strategy

**Unit Tests Updates:**
- Update CostMatrix tests to test pure functions independently
- Update Structures tests to test functional implementations
- Test integration between functional CostMatrix and Structures
- Maintain test coverage for all existing functionality

**Simplified Testing Approach:**
- No need for migration compatibility tests
- Focus on ensuring functional implementations provide identical behavior
- Streamlined test updates without adapter/compatibility layers

## Risk Assessment

### Areas of Attention

1. **Memory Management**
   - Ensure functional implementations maintain identical memory patterns
   - Preserve existing memory structure for seamless operation

2. **Memoization Behavior**
   - Maintain exact same caching logic and performance characteristics
   - Ensure no performance regression from functional approach

3. **Integration Points**
   - Update RoomInstance and any other dependencies correctly
   - Ensure all imports and references are updated consistently

## Success Criteria

### Functional Requirements
- [ ] All current StructuresInstance functionality preserved
- [ ] All current CostMatrix functionality preserved
- [ ] Memory usage patterns maintained
- [ ] Visual output identical to current implementation
- [ ] Construction site creation behavior unchanged

### Non-Functional Requirements
- [ ] Performance equal to or better than current implementation
- [ ] Memory allocation reduced or maintained
- [ ] Code complexity reduced (measured by cyclomatic complexity)
- [ ] Test coverage maintained or improved
- [ ] No regression in existing functionality

### Code Quality Requirements
- [ ] All functions are pure where possible
- [ ] No side effects in calculation functions
- [ ] Clear separation between data and behavior
- [ ] Comprehensive TypeScript types
- [ ] Consistent error handling patterns

## Conclusion

This refactoring represents the final step in migrating the Screeps codebase to functional programming patterns. The direct replacement approach allows for a clean, straightforward implementation that improves code maintainability, testability, and performance while preserving all existing functionality.

The functional design with dependency injection and pure functions will provide better separation of concerns and make the code easier to reason about and test. The key to success will be maintaining the exact same memory patterns and memoization behavior while restructuring the code organization around pure functions and immutable data structures.
