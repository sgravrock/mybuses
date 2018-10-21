# mybuses
A highly specialized transit trip planning app. It probably won't work for you.

## Initial setup

1. Make sure that you have Node 8.9.4 or later installed.
[NVM](https://github.com/creationix/nvm) might be helpful if you have an older version.
2. `$ yarn install`
3. Obtain a [OneBusAway API key](http://pugetsound.onebusaway.org/p/OneBusAwayApiService.action).
4. Set the following environment variables. 
[`direnv`](https://direnv.net/) is your friend here.
```
export REACT_APP_OBA_API_KEY=your key from step 3
export REACT_APP_SRC_LAT=default source latitude
export REACT_APP_SRC_LON=default source longitude
export REACT_APP_DEST_LAT=default destination latitude
export REACT_APP_DEST_LON=default destination longitude
```

## Running the tests

`$ yarn test`

## Running the app

`$ yarn start`

## Building and deploying for production

1. To serve from a non-root path, set `"homepage"` in package.json to the path.
2. `$ yarn build`
3. Copy the ` build` directory to wherever it will be served from.