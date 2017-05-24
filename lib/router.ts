const http = require("http");
import { ObaClient, ArrivalAndDeparture, TripDetails, Point } from "./obaClient";
import { ObaRequest } from "./obaRequest";
const filters = require("./filters");

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
	srcStopIds: string[],
	destStopIds: string[],
}

interface TripWithStops {
	trip: TripDetails,
	srcStopIds: string[],
	destStopIds: string[],
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
						srcStopIds: t.srcStopIds,
						destStopIds: t.destStopIds,
					};
				});
			});
	}

	async _tripsBetweenStopSets(srcStopIds: string[], destStopIds: string[]): Promise<TripWithStops[]> {
		const [srcArrDeps, destArrDeps] = await Promise.all([
			this._arrivalsAndDeparturesForStops(srcStopIds),
			this._arrivalsAndDeparturesForStops(destStopIds)
		]);

		const trips = filters.excludeWrongWay(
			filters.groupEndpoints(srcArrDeps, destArrDeps));
		const stopsByTrip: Map<string, {s: string[], e: string[]}> = new Map();
		const tripIds: Set<string> = new Set();

		trips.forEach(([s, e]: [ArrivalAndDeparture, ArrivalAndDeparture]) => {
			const stops = stopsByTrip.get(s.tripId);

			function insert(a: string[], e: string) {
				if (a.indexOf(e) === -1) {
					a.push(e);
				}
			}

			if (stops) {
				insert(stops.s, s.stopId);
				insert(stops.e, e.stopId);
			} else {
				stopsByTrip.set(s.tripId, { s: [s.stopId], e: [e.stopId] });
			}
		});

		const promises: Promise<TripWithStops>[] = [];
		stopsByTrip.forEach((stops, tripId) => {
			const p = this._obaClient.tripDetails(tripId)
				.then(trip => {
					return {
						trip: trip,
						srcStopIds: stops.s.sort(),
						destStopIds: stops.e.sort()
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
