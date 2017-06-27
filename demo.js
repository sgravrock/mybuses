#!/usr/bin/env node
const Router = require("./lib/router").Router;

let src, dest;

if (process.argv.length === 6) {
	src = {
		lat: parseFloat(process.argv[2]),
		lon: parseFloat(process.argv[3]),
	};
	dest = {
		lat: parseFloat(process.argv[4]),
		lon: parseFloat(process.argv[5]),
	};
} else if (process.argv.length === 2) {
	src = {
		lat: parseFloat(process.env["SRC_LAT"]),
		lon: parseFloat(process.env["SRC_LON"]),
	};
	dest = {
		lat: parseFloat(process.env["DEST_LAT"]),
		lon: parseFloat(process.env["DEST_LON"]),
	};
} else {
	console.error("Usage: ", process.argv0, process.argv[1], "[srcLat srcLon destLat destLon]");
	process.exit(1);
}


const router = new Router({key: "test"});
router.findTrips(src, dest).then(function(trips) {
	console.log("Found", trips.length, "trips:");
	console.log(JSON.stringify(trips, null, 4));
});
