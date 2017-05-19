#!/usr/bin/env node
const Router = require("./lib/router");

if (process.argv.length !== 6) {
	console.error("Usage: ", process.argv0, process.argv[1], "srcLat srcLon destLat destLon");
	process.exit(1);
}

const src = {
	lat: parseFloat(process.argv[2]),
	lon: parseFloat(process.argv[3]),
};
const dest = {
	lat: parseFloat(process.argv[4]),
	lon: parseFloat(process.argv[5]),
};

const router = new Router({key: "test"});
router.findTrips(src, dest).then(function(trips) {
	console.log("Found", trips.length, "trips:");
	trips.forEach((t) => {
		console.log("Trip", t.tripId, ": route", t.route.shortName);
	});
});
