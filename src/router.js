// @flow
import type {Point} from "./types";
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

function makeObaClient(deps: any) {
	const obaRequest = deps.obaRequest || new ObaRequest({
		http: deps.http || http,
		key: deps.key
	});
	return new ObaClient({ obaRequest: obaRequest });
}


class Router {
	_obaClient: ObaClient;

	constructor(deps: any) {
		this._obaClient = deps.obaClient || makeObaClient(deps);
	}

	async findTrips(src: Point, dest: Point) {
		const [srcStops, destStops] = await Promise.all([
			this._obaClient.stopsForLocation(src),
			this._obaClient.stopsForLocation(dest),
		]);

		return this._tripsBetweenStopSets(srcStops, destStops);
	}

	async _tripsBetweenStopSets(srcStopIds: [string], destStopIds: [string]) {
		const [srcTripIds, destTripIds] = await Promise.all([
			this._tripIdsForStops(srcStopIds),
			this._tripIdsForStops(destStopIds)
		]);
		
		const tripIds = unique(intersection(srcTripIds, destTripIds));
		const promises = tripIds.map((tripId) => {
			return this._obaClient.tripDetails(tripId);
		});
		return Promise.all(promises);
	}

	async _tripIdsForStops(stopIds: [string]) {
		const arrDeps = await this._arrivalsAndDeparturesForStops(stopIds);
		return flatten(arrDeps)
			.map((arrDep) => arrDep.tripId);
	}

	_arrivalsAndDeparturesForStops(stopIds: [string]) {
		const promises = stopIds.map((id) => {
			return this._obaClient.arrivalsAndDeparturesForStop(id);
		});
		return Promise.all(promises).then(flatten);
	}
}

module.exports = Router;
