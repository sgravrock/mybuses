# mybuses
A highly specialized transit trip planning app. It probably won't work for you.

**WARNING: This software is unmaintained. Its dependencies are out of date
and likely to have security vulnerabilities. Do not use mybuses without at
least updating all dependencies.**

mybuses is a transit trip planner for King County Metro. It lists all available
single-leg trips between two predetermined points, even when those trips are on
different bus routes. Most of the big map and trip planning apps deal poorly 
with this scenario: They tend to combine all of the available routes into a
single logical "route" and show only one trip from it. Or they set a ver short
maximum walking distance. mybuses does better by showing all trips and by using
a maximum walking distance that's more in line with my preferences.

Things it doesn't do that you might want:

* Provide a way to change endpoints without editng code
* Provide a way to change walking distance without editng code
* Find trips that include transfers
* Find trips that depart at a later date/time
* Work with any other transit system besides King County Metro

Things it doesn't do that I might want:

* Filter routes on various criteria, e.g. show only expresses
* Keep showing trips that were scheduled to depart in the past but have no
  real-time departure info
  
From a technical standpoint, the main thing that's interesting about mybuses
is the amount of tech stach churn it's been through without a stop-the-world
rewrite. It's been an Express app that rendered HTML server-side. It's been
a React app that talks to an Express app. It's been a React app that talks
directly to onebusaway using jsonp. (Figuring out how to unit test that was
fun.) It's been written in straight JavaScript, Flow, and TypeScript. It's
been hosted on Cloud Foundry and on a web server that really only handles
static files. It would've become a PWA by now if iOS had good support for those.

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
