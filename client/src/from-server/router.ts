import { IObaClient, ArrDep, TripDetails, Point } from "./obaClient";
import * as filters from "./filters";
import { distanceInMeters } from "./distance";
import { sortBy } from "./sort";


function flatten<T>(arrays: T[][]): T[] {
	return arrays.reduce((a, b) => a.concat(b), []);
}

export interface Routing {
	tripId: string,
	route: {
		id: string,
		shortName: string
	},
	srcStop: SourceStop,
	destStop: DestStop,
}

export enum TimeType {
	Scheduled,
	Predicted
}

export interface RelativeTime {
	minutesUntil: number,
	type: TimeType
}

export interface AbsoluteTime {
	date: Date,
	type: TimeType
}

export interface SourceStop {
	stopId: string,
	name: string,
	location: Point,
	metersFromEndpoint: number,

	// Just using arrival time assumes that buses arrive and depart at
	// the same time, which is true with the rare exception of layover
	// stops (e.g. 1_18085 on the 44).
	arrivalTime: RelativeTime,
}

export interface DestStop {
	stopId: string,
	name: string,
	location: Point,
	metersFromEndpoint: number,
	arrivalTime: AbsoluteTime,
}

export interface TripWithStops {
	trip: TripDetails,
	srcStop: SourceStop,
	destStop: DestStop,
}


export class Router {
	_obaClient: IObaClient;

	constructor(obaClient: IObaClient) {
		this._obaClient = obaClient;
	}

	async findTrips(src: Point, dest: Point): Promise<Routing[]> {
		const [srcStops, destStops] = await Promise.all([
			this._obaClient.stopsForLocation(src),
			this._obaClient.stopsForLocation(dest),
		]);

		return this._tripsBetweenStopSets(src, dest, srcStops, destStops)
			.then((trips) => {
				const result = trips.map((t) => {
					return {
						tripId: t.trip.tripId,
						route: t.trip.route,
						srcStop: t.srcStop,
						destStop: t.destStop,
					};
				});
				sortBy(result, r => r.srcStop.arrivalTime.minutesUntil);
				return result;
			});
	}

	async _tripsBetweenStopSets(src: Point, dest: Point, srcStopIds: string[], destStopIds: string[]): Promise<TripWithStops[]> {

		const [srcArrDeps, destArrDeps] = await Promise.all([
			this._arrivalsAndDeparturesForStops(srcStopIds),
			this._arrivalsAndDeparturesForStops(destStopIds)
		]);

		const trips = filters.groupEndpointPairsByTrip(
			filters.excludeWrongWay(
				filters.groupEndpoints(srcArrDeps, destArrDeps)));
		const promises: Promise<TripWithStops>[] = [];

		trips.forEach((endpointPairs, tripId) => {
			const p = this._obaClient.tripDetails(tripId)
				.then(trip => {
					const srcStops = filters.uniqueBy(endpointPairs, (p) => p[0].stopId)
						.map((p) => makeSourceStop(p[0], src));
					const destStops = filters.uniqueBy(endpointPairs, (p) => p[1].stopId)
						.map((p) => makeDestStop(p[1], dest));

					return {
						trip: trip,
						srcStop: filters.nearest(srcStops),
						destStop: filters.nearest(destStops),
					};
				});

			promises.push(p);
		});

		return Promise.all(promises);
	}

	_arrivalsAndDeparturesForStops(stopIds: string[]): Promise<ArrDep[]> {
		const promises = stopIds.map((id) => {
			return this._obaClient.arrivalsAndDeparturesForStop(id);
		});
		return Promise.all(promises).then(flatten);
	}
}

function makeSourceStop(arrDep: ArrDep, endpoint: Point): SourceStop {
	const distance = Math.round(distanceInMeters(arrDep, endpoint));

	return {
		stopId: arrDep.stopId,
		name: arrDep.stopName,
		location: { lat: arrDep.lat, lon: arrDep.lon },
		metersFromEndpoint: distance,
		arrivalTime: relArrivalTime(arrDep),
	};
}

function relArrivalTime(arrDep: ArrDep): RelativeTime {
	if (arrDep.predictedArrivalTime) {
		return {
			minutesUntil: minutesUntilDate(arrDep.predictedArrivalTime),
			type: TimeType.Predicted,
		};
	} else {
		return {
			minutesUntil: minutesUntilDate(arrDep.scheduledArrivalTime),
			type: TimeType.Scheduled,
		};
	}
}

function minutesUntilDate(date: Date): number {
	const now = new Date().getTime();
	const millisUntil = date.getTime() - now;
	return Math.round((millisUntil / 1000.0 / 60.0) * 10) / 10;
}

function makeDestStop(arrDep: ArrDep, endpoint: Point): DestStop {
	const distance = Math.round(distanceInMeters(arrDep, endpoint));

	return {
		stopId: arrDep.stopId,
		name: arrDep.stopName,
		location: { lat: arrDep.lat, lon: arrDep.lon },
		metersFromEndpoint: distance,
		arrivalTime: absArrivalTime(arrDep),
	};
}

function absArrivalTime(arrDep: ArrDep): AbsoluteTime {
	if (arrDep.predictedArrivalTime) {
		return {
			date: arrDep.predictedArrivalTime,
			type: TimeType.Predicted,
		};
	} else {
		return {
			date: arrDep.scheduledArrivalTime,
			type: TimeType.Scheduled,
		};
	}
}
