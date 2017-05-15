var httpVcr = require("./http-vcr");

const recorder = httpVcr.record("spec/fixtures");
//const recorder = httpVcr.playback("spec/fixtures");
recorder.strip("key=TEST&");
const host = "api.pugetsound.onebusaway.org";
const time = "1494865594648";

function getNext() {
	const spec = queue.shift();

	if (!spec) {
		console.log("Done");
		report();
		return;
	}

	//console.log("Getting " + spec.path);
	recorder.get({ host: host, path: spec.path }, function(response) {
		var body = ""
		response.on("data", (chunk) => { body+= chunk });
		response.on("end", function() {
			var doc = JSON.parse(body);

			if (doc.code === 429) {
				console.error("Rate limit exceeded. Retrying in 5 seconds.");
				queue.unshift(spec);
				setTimeout(getNext, 5000);
			} else {
				spec.callback(doc);
				setTimeout(getNext, 100);
			}
		});
	});
}

function handleStopsNearArrival(doc) {
	doc.data.list.forEach((stop) => {
		queue.push({
			path: "/api/where/arrivals-and-departures-for-stop/" + stop.id + ".json?key=TEST&time=" + time,
			callback: handleArrivalStop
		})
	});
}

function handleStopsNearDeparture(doc) {
	doc.data.list.forEach((stop) => {
		queue.push({
			path: "/api/where/arrivals-and-departures-for-stop/" + stop.id + ".json?key=TEST&time=" + time,
			callback: handleDepartureStop
		})
	});
}

function handleDepartureStop(doc) {
	doc.data.entry.arrivalsAndDepartures.forEach((arrDep) => {
		departureTrips[arrDep.tripId] = {
			routeShortName: arrDep.routeShortName,
			scheduledDepartureTime: 1494874772000
		};
	});
}

function handleArrivalStop(doc) {
	doc.data.entry.arrivalsAndDepartures.forEach((arrDep) => {
		const departureTrip = departureTrips[arrDep.tripId];

		if (departureTrip) {
			queue.push({
				path: "/api/where/trip-details/" + arrDep.tripId + ".json?key=TEST&time=" + time,
				callback: handleTrip
			});
		}
	});
}
function handleTrip(doc) {
	trips.push(doc);
}

function report() {
	console.log("Got ", trips.length, " trips");
	trips.forEach((trip) => {
		const serviceDate = trip.data.entry.serviceDate;
		const tripId = trip.data.entry.tripId;
		const departureTime = departureTrips[tripId].scheduledDepartureTime;

		console.log("Trip " + tripId + ":")
		console.log("Route " + departureTrips[tripId].routeShortName);
		console.log("Departs at " + new Date(departureTime));
		console.log("");
	});
}

var queue = [
	{
		path: "/api/where/stops-for-location.json?key=TEST&lat=47.663667&lon=-122.376109&time=1494865594648",
		callback: handleStopsNearDeparture
	},
	{
		path: "/api/where/stops-for-location.json?key=TEST&lat=47.609776&lon=-122.337830&time=1494865594648",
		callback: handleStopsNearArrival
	}
];
var departureTrips = {};
var trips = [];


getNext();
