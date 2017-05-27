const http = require("http");
import { ObaClient, ArrivalAndDeparture, TripDetails, Point } from "./obaClient";
import { ObaRequest } from "./obaRequest";
import { excludeWrongWay, groupEndpoints, groupEndpointPairsByTrip } from "./filters";
import { uniqueBy } from "./unique";

function flatten<T>(arrays: T[][]): T[] {
	return arrays.reduce((a, b) => a.concat(b), []);
}

function unique(a: any[]): any[] {
	return Array.from(new Set(a));
}

function makeObaClient(deps: any) {
	const obaRequest = deps.obaRequest || new ObaRequest({
		http: deps.http || http,
		key: deps.key
	});
	return new ObaClient({ obaRequest: obaRequest });
}

export interface Routing {
	tripId: string,
	route: {
		id: string,
		shortName: string
	},
	srcStops: Stop[],
	destStops: Stop[],
}

export interface Stop {
	stopId: string,
	location: Point,
}

export interface TripWithStops {
	trip: TripDetails,
	srcStops: Stop[],
	destStops: Stop[],
}


export class Router {
	_obaClient: ObaClient;

	constructor(deps: any) {
		this._obaClient = deps.obaClient || makeObaClient(deps);
	}

	async findTrips(src: Point, dest: Point): Promise<Routing[]> {
		const [srcStops, destStops] = await Promise.all([
			this._obaClient.stopsForLocation(src),
			this._obaClient.stopsForLocation(dest),
		]);

		return this._tripsBetweenStopSets(srcStops, destStops)
			.then((trips) => {
				return trips.map((t) => {
					return {
						tripId: t.trip.tripId,
						route: t.trip.route,
						srcStops: t.srcStops,
						destStops: t.destStops,
					};
				});
			});
	}

	async _tripsBetweenStopSets(srcStopIds: string[], destStopIds: string[]): Promise<TripWithStops[]> {
		const [srcArrDeps, destArrDeps] = await Promise.all([
			this._arrivalsAndDeparturesForStops(srcStopIds),
			this._arrivalsAndDeparturesForStops(destStopIds)
		]);

		const trips = groupEndpointPairsByTrip(
			excludeWrongWay(groupEndpoints(srcArrDeps, destArrDeps)));
		const promises: Promise<TripWithStops>[] = [];

		trips.forEach((endpointPairs, tripId) => {
			const p = this._obaClient.tripDetails(tripId)
				.then(trip => {
					const srcStops = uniqueBy(endpointPairs, (p) => p[0].stopId)
						.map((p) => makeStop(p[0]));
					const destStops = uniqueBy(endpointPairs, (p) => p[1].stopId)
						.map((p) => makeStop(p[1]));

					return {
						trip: trip,
						srcStops: srcStops,
						destStops: destStops,
					};
				});

			promises.push(p);
		});

		return Promise.all(promises);
	}

	_arrivalsAndDeparturesForStops(stopIds: string[]): Promise<ArrivalAndDeparture[]> {
		const promises = stopIds.map((id) => {
			return this._obaClient.arrivalsAndDeparturesForStop(id);
		});
		return Promise.all(promises).then(flatten);
	}
}

function makeStop(arrDep: ArrivalAndDeparture): Stop {
	return {
		stopId: arrDep.stopId,
		location: { lat: arrDep.lat, lon: arrDep.lon }
	}
}
