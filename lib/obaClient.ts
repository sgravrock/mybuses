import { ObaRequest } from "./obaRequest";
const find = require("lodash.find");

export type Point = {
	lat: number,
	lon: number
};

export type ArrivalAndDeparture = {
	tripId: string,
	stopSequence: number
};

export type TripDetails = {
	tripId: string,
	route: {
		id: string,
		shortName: string
	}
};



export class ObaClient {
	_obaRequest: any;

	constructor(deps: any) {
		this._obaRequest = deps.obaRequest || new ObaRequest(deps);
	}

	async stopsForLocation(loc: Point): Promise<string[]> {
		const response = await this._obaRequest.get(
			"/api/where/stops-for-location.json", loc);
		return response.data.list.map((stop: any) => stop.id);
	}

	async arrivalsAndDeparturesForStop(stopId: string): Promise<ArrivalAndDeparture[]> {
		if (!stopId) {
			return Promise.reject("arrivalsAndDeparturesForStop requires a stop ID");
		}

		const path = "/api/where/arrivals-and-departures-for-stop/" + stopId +
			".json";
		const response = await this._obaRequest.get(path, {});
		return response.data.entry.arrivalsAndDepartures;
	}

	async tripDetails(tripId: string): Promise<TripDetails> {
		const path = "/api/where/trip-details/" + tripId + ".json";
		const response = await this._obaRequest.get(path, {});
		const entry = response.data.entry;
		const refs = response.data.references;
		const trip = find(refs.trips, (t: any) => t.id === tripId);
		const route = find(refs.routes, (r: any) => r.id === trip.routeId);

		return {
			tripId: entry.tripId,
			route: {
				id: route.id,
				shortName: route.shortName
			}
		};
	}
}