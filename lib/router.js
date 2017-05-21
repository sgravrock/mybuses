const http = require("http");
const ObaClient = require("./obaClient");
const ObaRequest = require("./obaRequest");
const filters = require("./filters");

function flatten(arrays) {
	return arrays.reduce((a, b) => a.concat(b), []);
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

	async findTrips(src, dest) {
		const [srcStops, destStops] = await Promise.all([
			this._obaClient.stopsForLocation(src),
			this._obaClient.stopsForLocation(dest),
		]);

		return this._tripsBetweenStopSets(srcStops, destStops);
	}

	async _tripsBetweenStopSets(srcStopIds, destStopIds) {
		const [srcArrDeps, destArrDeps] = await Promise.all([
			this._arrivalsAndDeparturesForStops(srcStopIds),
			this._arrivalsAndDeparturesForStops(destStopIds)
		]);
		
		const trips = filters.excludeWrongWay(
			filters.groupEndpoints(srcArrDeps, destArrDeps));
		
		const tripIds = unique(trips.map(([s, e]) => s.tripId));
		const promises = tripIds.map((tripId) => {
			return this._obaClient.tripDetails(tripId);
		});
		return Promise.all(promises);
	}

	_arrivalsAndDeparturesForStops(stopIds) {
		const promises = stopIds.map((id) => {
			return this._obaClient.arrivalsAndDeparturesForStop(id);
		});
		return Promise.all(promises).then(flatten);
	}
}

module.exports = Router;
