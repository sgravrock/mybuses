// @flow
import type {TripStub, TripDetails, Point} from "./types";
const ObaRequest = require("./obaRequest");
const find = require("lodash.find");


class ObaClient {
	_obaRequest: ObaRequest;

	constructor(deps: {}) {
		this._obaRequest = deps.obaRequest || new ObaRequest(deps);
	}

	async stopsForLocation(loc: Point) {
		const response = await this._obaRequest.get(
			"/api/where/stops-for-location.json", loc);
		return response.data.list.map((stop) => stop.id);
	}

	async arrivalsAndDeparturesForStop(stopId: string): Promise<[TripStub]> {
		if (!stopId) {
			return Promise.reject("arrivalsAndDeparturesForStop requires a stop ID");
		}

		const path = "/api/where/arrivals-and-departures-for-stop/" + stopId +
			".json";
		const response = await this._obaRequest.get(path, {});
		const arrDeps = response.data.entry.arrivalsAndDepartures;
		return arrDeps.map((arrDep) => ({ tripId: arrDep.tripId }));
	}

	async tripDetails(tripId: string): Promise<TripDetails> {
		const path = "/api/where/trip-details/" + tripId + ".json";
		const response = await this._obaRequest.get(path, {});
		const entry = response.data.entry;
		const refs = response.data.references;
		const trip = find(refs.trips, (t) => t.id === tripId);
		const route = find(refs.routes, (r) => r.id === trip.routeId);

		return {
			tripId: entry.tripId,
			route: {
				id: route.id,
				shortName: route.shortName
			}
		};
	}
}

module.exports = ObaClient;