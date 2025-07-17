# AI Coding Agent Instructions for Screeps-Scripts

## Project Architecture

- **Domain:** Screeps AI, written in TypeScript, organized by game concepts (creeps, rooms, structures, roles).
- **Major Components:**
  - `src/`: Main source code. Key files: `main.ts`, `RoomInstance.ts`, `CreepsInstance.ts`, `StructuresInstance.ts`, `SpawnerInstance.ts`, `utils/`, and especially `utils/roomAdditions.ts` (performance-critical caching of game objects).
  - `creep roles/`: Specialized logic for each creep role (e.g., `RoleBuilder.ts`, `RoleHarvester.ts`).
  - `test/src/`: All new test files (unit/integration/specs) must be placed here and written with Jest. Do **not** use Mocha or Chai for new tests—these are legacy frameworks from the starter kit and should be avoided going forward.
  - `docs/`: Contains general Screeps development tips and best practices from the original starter kit. **Project-specific documentation is only in the root `README.md`.**

## Build, Deploy, and Test Workflows

- **Build:** Uses Rollup (`rollup.config.js`). Main build command: `npm run build`.
- **Deploy:** Use `npm run push-main` to build and upload code to Screeps server (see `screeps.json` for config).
- **Test:** 
  - **Unit/Integration:** All tests run via `npm test`. Test files must be in `test/src/` and named `*.spec.ts` or `*.test.ts`.
  - **Testing Framework:** Use Jest with `screeps-jest` for mocking Screeps globals. Legacy Mocha/Chai tests exist but should not be used for new code.
  - **Test Setup:** Always mock Screeps globals (`Game`, `Memory`, etc.) at the top of each test file using `mockGlobal` from `screeps-jest`.
  - **Do not place test files in `src/`**—keep them in `test/src/` for clarity and maintainability.

## Project-Specific Patterns & Conventions

- **TDD & Tidy First:** Strictly follow Red-Green-Refactor and separate structural from behavioral changes. See below for workflow.
- **Globals:** All Screeps globals must be mocked before importing any user code in tests.
- **Room/Creep/Structure Logic:** Each major game concept is currently encapsulated in its own class (see `RoomInstance`, `CreepsInstance`, `StructuresInstance`).
- **Role Pattern:** Creep roles are implemented as classes in `creep roles/`, each with a `run()` method.
- **Helper Functions:** Shared logic is in `utils/HelperFunctions.ts` and `utils/roomAdditions.ts` (the latter is key for performance).
- **Module Bundling:** Rollup is used; see `rollup.config.js` and `docs/in-depth/module-bundling.md` for details.

## Integration Points & External Dependencies

- **Screeps Server:** Deploy via Rollup and `screeps.json`. For private servers, ensure `screepsmod-auth` is installed.
- **Third-Party Libraries:** Use npm for dependencies (e.g., `screeps-profiler`, `lodash`).
- **Type Definitions:** Uses [typed-screeps](https://github.com/screepers/typed-screeps) for Screeps types.

## Example TDD Workflow

1. Write a failing test in `test/src/` (use `mockGlobal` for Screeps globals).
2. Implement the minimal code to pass the test.
3. Refactor only after tests pass.
4. Separate structural and behavioral changes; commit them independently.
5. Use clear, behavior-driven test names (e.g., `shouldDeleteMemoryOfMissingCreeps`).

## Key Files & Directories

- `src/main.ts`: Entry point; main game loop.
- `src/RoomInstance.ts`, `src/CreepsInstance.ts`, `src/StructuresInstance.ts`: Core game logic.
- `src/utils/roomAdditions.ts`: Performance-critical caching and extension of Room objects.
- `src/creep roles/`: Creep role classes.
- `test/src/`: All new test files (Jest only).
- `rollup.config.js`, `screeps.json`: Build and deploy configuration.
- `README.md`: The only project-specific documentation; see Issues and TODOs for planned changes.

## Planned Changes

- **Migration to Functional Programming:** Classes representing game objects and concepts are planned to be refactored to a more functional approach.
- **CostMatrix Refactor:** Improve performance and support for more structure types.
- **Other Planned Changes:** See `README.md` Issues and TODOs section for additional refactoring, logic improvements, and feature plans (e.g., multiroom logic, builder calculation, visual status, etc.).

## Additional Notes

- **Do not mix manual and library-based mocks in tests.**
- **Always run all tests before committing.**
- **Reference documentation in `docs/` for general Screeps development tips; project-specific info is only in `README.md`.**

---

## TDD & Tidy First Principles (Retained from previous instructions)

- Always follow the TDD cycle: Red → Green → Refactor
- Write the simplest failing test first
- Implement the minimum code needed to make tests pass
- Refactor only after tests are passing
- Separate structural and behavioral changes in commits
- Validate structural changes do not alter behavior by running tests before and after
