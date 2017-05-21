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


export class Router {
	_obaClient: ObaClient;

	constructor(deps: any) {
		this._obaClient = deps.obaClient || makeObaClient(deps);
	}

	async findTrips(src: Point, dest: Point): Promise<TripDetails[]> {
		const [srcStops, destStops] = await Promise.all([
			this._obaClient.stopsForLocation(src),
			this._obaClient.stopsForLocation(dest),
		]);

		return this._tripsBetweenStopSets(srcStops, destStops);
	}

	async _tripsBetweenStopSets(srcStopIds: string[], destStopIds: string[]): Promise<TripDetails[]> {
		const [srcArrDeps, destArrDeps] = await Promise.all([
			this._arrivalsAndDeparturesForStops(srcStopIds),
			this._arrivalsAndDeparturesForStops(destStopIds)
		]);

		const trips = filters.excludeWrongWay(
			filters.groupEndpoints(srcArrDeps, destArrDeps));

		const tripIds = unique(trips.map(([s, e]: [ArrivalAndDeparture, ArrivalAndDeparture]) => s.tripId));
		const promises = tripIds.map((tripId) => {
			return this._obaClient.tripDetails(tripId);
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
