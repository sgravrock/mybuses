const http = require("http");
const ObaClient = require("./obaClient");
const ObaRequest = require("./obaRequest");

function flatten(arrays) {
	return arrays.reduce((a, b) => a.concat(b), []);
}

function intersection(a1, a2) {
	return a1.filter((x) => a2.indexOf(x) !== -1);
}

function unique(a) {
	return Array.from(new Set(a));
}

function makeObaClient(deps) {
	const obaRequest = deps.obaRequest || new ObaRequest({
		http: deps.http || http,
		key: deps.key
	});
	return new ObaClient({ obaRequest: obaRequest });
}

class Router {
	constructor(deps) {
		this._obaClient = deps.obaClient || makeObaClient(deps);
	}

	findTrips(src, dest) {
		const srcStopsPromise = this._obaClient.stopsForLocation(src);
		const destStopsPromise = this._obaClient.stopsForLocation(dest);

		return Promise.all([srcStopsPromise, destStopsPromise])
				.then(([srcStops, destStops]) => {
					return this._tripsBetweenStopSets(srcStops, destStops);
				});
	}

	_tripsBetweenStopSets(srcStopIds, destStopIds) {
		const srcTripIdsPromise = this._arrivalsAndDeparturesForStops(srcStopIds)
			.then(flatten)
			.then((arrDeps) => arrDeps.map((arrDep) => arrDep.tripId));
		const destTripIdsPromise = this._arrivalsAndDeparturesForStops(destStopIds)
			.then(flatten)
			.then((arrDeps) => arrDeps.map((arrDep) => arrDep.tripId));
		
		return Promise.all([srcTripIdsPromise, destTripIdsPromise])
			.then(([srcTripIds, destTripIds]) => {
				const tripIds = unique(intersection(srcTripIds, destTripIds));
				const promises = tripIds.map((tripId) => {
					return this._obaClient.tripDetails(tripId);
				});
				return Promise.all(promises);
			});
	}

	/*
	_tripsForStops(stopIds) {
		return this._arrivalsAndDeparturesForStops(stopIds)
				.then((arrDeps) => {
					const promises = arrDeps.map((arrDep) => {
						return this._obaClient.tripDetails(arrDep.tripId);
					});
					return Promise.all(promises);
				});
	}
	*/

	_arrivalsAndDeparturesForStops(stopIds) {
		const promises = stopIds.map((id) => {
			return this._obaClient.arrivalsAndDeparturesForStop(id);
		});
		return Promise.all(promises).then(flatten);
	}
}

module.exports = Router;
