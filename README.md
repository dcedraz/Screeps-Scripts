## This repo is meant for keeping saved all scripts written for the game Screeps.com


#### It started as a clone of the [screeps-typescript-starter kit](https://github.com/screepers/screeps-typescript-starter)  repository.

The code is written within the src directory, the `.ts` files are converted into the `main.js` within the `dist` folder using rollup packager manager.

## Getting Started

1. Clone this repo locally and install all dependencies with `npm install` and `yarn`.
2. Move or copy `.env.sample` to `.env` and update it with your [Steam API key](https://steamcommunity.com/dev/apikey).
3. Move or copy `screeps.sample.json` to `screeps.json` and edit it with your credentials.
    * For `main` and `sim` entries, update `token` with your Steam API key.
    * For the `pserver` entry, update `username` and `password` with any values. This will be later on used to configure the auth mod (instructions below)
4. Install [Screeps World](https://store.steampowered.com/app/464350/Screeps_World/) from steam.
5. Install the [screeps-steamless-client](https://github.com/laverdet/screeps-steamless-client).
    * `npm install -g screeps-steamless-client` to install
    * `npx screeps-steamless-client` to run
      * http://localhost:8080/(https://screeps.com)/
      * http://localhost:8080/(http://localhost:21025/)/
6. Run the local private server with `docker compose up -d`
7. Configure credentials for your private server
    * This is managed by [screepsmod-auth](https://github.com/ScreepsMods/screepsmod-auth)
    * The credentials should be the same used in Step 3 above.
    * Go to http://127.0.0.1:21025/authmod/password/, configure a new password and log into Steam.
    * Open the server CLI with `docker compose exec screeps cli` and run `setPassword('Username', 'YourDesiredPassword')`
8. You should be good to go!
    * Make your code changes and push it to the branches with the following:
        * `npm run push-main` to push to main/prod
        * `npm run push-sim` to push to sim/dev
        * `npm run push-pserver` to push to local private server


## Credits for code taken from someone else
* `memHack` from here: https://github.com/glitchassassin/screeps/blob/master/src/types.d.ts

* `RoomAdditions` - Better way to memoize on global by Marvin:
https://github.com/The-International-Screeps-Bot/The-International-Open-Source/blob/Typescript/src/room/roomAdditions.ts

## Inspiring code snippets:
* `Base planning algorithms` from here: https://github.com/CarsonBurke/Screeps-Tutorials/tree/Master/basePlanningAlgorithms
* `screeps-snippets` from here: https://github.com/screepers/screeps-snippets

## Plugins and helpers

* `screeps-launcher` https://github.com/screepers/screeps-launcher
* `screeps-server` by Jomik https://github.com/Jomik/screeps-server
* `screeps-steamless-client` https://github.com/laverdet/screeps-steamless-client
* `screeps-mods` https://github.com/ScreepsMods
* `typed-screeps` https://github.com/screepers/typed-screeps

## Server commands

* Reset the server:
```bash
system.resetAllData()
```
* Pause the simulation:
```bash
system.pauseSimulation()
```
* Remove bots:
```bash
utils.removeBots()
```
* Get stats:
```bash
utils.getStats()
```
* Set tick duration:
```bash
system.setTickDuration(1000)
```

* Update controller and other objects:
```bash
storage.db['rooms.objects'].update({ _id: 'idOfController' },{ $set: { level: 8 }})
```

## Issues and TODOs
* Remove unused folders (docs)
* Remove Mocha and Chai
* Refactor to functional programming
1. Fix issue with Spawns duplicating creeps
2. Refactor Harvesters logic to only drop energy when Hauler exists
3. Haulers should do something when there is no storage left
4. Calculate how many builders are needed
5. Build a visual status of the room
6. Build logic for multiroom operation