import { ObaRequest } from "./obaRequest";
const find = require("lodash.find");

export type Point = {
	lat: number,
	lon: number
};

export type ArrDep = {
	tripId: string,
	stopId: string,
	stopName: string,
	stopSequence: number,
	scheduledArrivalTime: Date,
	lat: number,
	lon: number
};

export interface TripDetails {
	tripId: string,
	route: {
		id: string,
		shortName: string
	}
};


export interface IObaClient {
	stopsForLocation(loc: Point): Promise<string[]>;
	arrivalsAndDeparturesForStop(stopId: string): Promise<ArrDep[]>;
	tripDetails(tripId: string): Promise<TripDetails>;
}


export class ObaClient implements IObaClient {
	_obaRequest: any;

	constructor(deps: any) {
		this._obaRequest = deps.obaRequest || new ObaRequest(deps);
	}

	async stopsForLocation(loc: Point): Promise<string[]> {
		const response = await this._obaRequest.get(
			"/api/where/stops-for-location.json", loc);
		return response.data.list.map((stop: any) => stop.id);
	}

	async arrivalsAndDeparturesForStop(stopId: string): Promise<ArrDep[]> {
		if (!stopId) {
			return Promise.reject("arrivalsAndDeparturesForStop requires a stop ID");
		}

		const path = "/api/where/arrivals-and-departures-for-stop/" + stopId +
			".json";
		const response = await this._obaRequest.get(path, {
			minutesBefore: 2,
			minutesAfter: 60
		});
		const stop = find(response.data.references.stops,
			(s: any) => s.id === stopId);

		return response.data.entry.arrivalsAndDepartures.map((arrDep: any) => {
			return {
				tripId: arrDep.tripId,
				stopSequence: arrDep.stopSequence,
				stopName: stop.name,
				scheduledArrivalTime: new Date(arrDep.scheduledArrivalTime),
				stopId: stopId,
				lat: stop.lat,
				lon: stop.lon,
			};
		});
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
