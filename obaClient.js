const ObaRequest = require("./obaRequest");

class ObaClient {
	constructor(deps) {
		this._obaRequest = deps.obaRequest || new ObaRequest(deps);
	}

	stopsForLocation({lat, lon}) {
		return this._obaRequest.get("/api/where/stops-for-location.json",
				{lat, lon})
			.then(function(response) {
				return response.data.list.map((stop) => stop.id);
			});
	}

	arrivalsAndDeparturesForStop(stopId) {
		if (!stopId) {
			return Promise.reject("arrivalsAndDeparturesForStop requires a stop ID");
		}

		const path = "/api/where/arrivals-and-departures-for-stop/" + stopId +
			".json";
		return this._obaRequest.get(path, {})
			.then(function(response) {
				return response.data.entry.arrivalsAndDepartures.map((arrDep) => ({
					tripId: arrDep.tripId
				}));
			});
	}

	tripDetails(tripId) {
		const path = "/api/where/trip-details/" + tripId + ".json";
		return this._obaRequest.get(path, {})
			.then(function(response) {
				var entry = response.data.entry;
				return {
					tripId: entry.tripId,
					stops: entry.schedule.stopTimes.map(function(s) {
						return { stopId: s.stopId };
					})
				};
			});
	}
}

module.exports = ObaClient;
