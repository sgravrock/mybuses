# mybuses
A highly specialized transit trip planning app. It probably won't work for you.

## Initial setup

1. Make sure that you have Node 8.9.4 or later installed.
[NVM](https://github.com/creationix/nvm) might be helpful if you have an older version.
2. `$ yarn install`
3. `$ cd client && yarn install`
4. Obtain a [OneBusAway API key](http://pugetsound.onebusaway.org/p/OneBusAwayApiService.action).
5. Set the following environment variables. 
[`direnv`](https://direnv.net/) is your friend here.
```
export OBA_API_KEY=your key from step 3
export SRC_LAT=default source latitude
export SRC_LON=default source longitude
export DEST_LAT=default destination latitude
export DEST_LON=default destination longitude
export PORT=3000
```

## Running the server tests

`$ yarn test`

## Running the client tests

`$ cd client && yarn test`

## Running the app

`$ cd server && node lib/main.js`
`$ cd client && yarn start`

Note that you'll have to rebuild after changing any TypeScript files. The 
easiest way to do that is to run `yarn test` for server changes and `yarn run bb` 
for client changes. You'll also have to restart the server if you changed any
server code.

## Deployment

Assuming that you have access to a Cloud Foundry space, just type `cf push`.
