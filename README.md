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

1. Run the screeps server on docker
2. Screeps server cli: 
3. Steamless client: `npx screeps-steamless-client`
   1. http://localhost:8080/(https://screeps.com)/
   2. http://localhost:8080/(http://localhost:21025)/
4. Auth mod commands:
   1. setPassword('Username', 'YourDesiredPassword')
5. Admin common commands:
   1. system.resetAllData()
   2. system.pauseSimulation()
   3. utils.removeBots()
   4. utils.getStats()
   5. system.setTickDuration(1000)