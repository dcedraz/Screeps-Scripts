## This repo is meant for keeping saved all scripts written for the game Screeps.com


#### It started as a clone of the [screeps-typescript-starter kit](https://github.com/screepers/screeps-typescript-starter)  repository.

The code is written within the src directory, the `.ts` files are converted into the `main.js` within the `dist` folder using rollup packager manager.

## Credits for code taken from someone else
* `memHack` from here: https://github.com/glitchassassin/screeps/blob/master/src/types.d.ts

## Inspiring code snippets:
* `Base planning algorithms` from here: https://github.com/CarsonBurke/Screeps-Tutorials/tree/Master/basePlanningAlgorithms
* `screeps-snippets` from here: https://github.com/screepers/screeps-snippets

### Things will need in the future:
* better way to memoize on global by Marvin:
https://github.com/The-International-Screeps-Bot/The-International-Open-Source/blob/Typescript/src/room/roomAdditions.ts


* `screeps-launcher`
https://github.com/screepers/screeps-launcher


* `screeps-server` by Jomik (this is another option for running a docker private server)
https://github.com/Jomik/screeps-server


* `screeps-steamless-client`
https://github.com/laverdet/screeps-steamless-client

## Notes to run on private server

1. Initiate colima `colima start` and `colima stop`
2. Run the screeps server with `docker-compose up`
3. Screeps server cli: `docker-compose exec screeps cli`
4. Steamless client: `npx screeps-steamless-client`
   1. http://localhost:8080/(https://screeps.com)/
   2. http://localhost:8080/(http://localhost:21025)/
5. Auth mod commands:
   1. setPassword('Username', 'YourDesiredPassword')
6. Admin common commands:
   1. system.resetAllData()
   2. system.pauseSimulation()
   3. utils.removeBots()
   4. utils.getStats()
   5. system.setTickDuration(1000)
   6. Update controller and other objects:
      > storage.db['rooms.objects'].update({ _id: 'idOfController' },{ $set: { level: 8 }})

## Issues and TODOs
1. Fix issue with Spawns duplicating creeps
2. Refactor Harvesters logic to only drop energy when Hauler exists
3. Haulers should do something when there is no storage left
4. Calculate how many builders are needed
5. Build a visual status of the room
6. Build logic for multiroom operation