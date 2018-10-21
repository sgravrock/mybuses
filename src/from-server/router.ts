import {ArrDep, IObaClient, Point, TripDetails} from "./obaClient";
import * as filters from "./filters";
import {distanceInMeters} from "./distance";
import {sortBy} from "./sort";
import {AbsoluteTime, DestStop, RelativeTime, SourceStop, TimeType, Trip} from "../trips";


function flatten<T>(arrays: T[][]): T[] {
	return arrays.reduce((a, b) => a.concat(b), []);
}

export interface TripWithStops {
	trip: TripDetails,
	srcStop: SourceStop,
	destStop: DestStop,
}

export interface IRouter {
	findTrips(src: Point, dest: Point): Promise<Trip[]>;
}

export class Router implements IRouter {
	_obaClient: IObaClient;

	constructor(obaClient: IObaClient) {
		this._obaClient = obaClient;
	}

	async findTrips(src: Point, dest: Point): Promise<Trip[]> {
		const [srcStops, destStops] = await Promise.all([
			this._obaClient.stopsForLocation(src),
			this._obaClient.stopsForLocation(dest),
		]);

		return this._tripsBetweenStopSets(src, dest, srcStops, destStops)
			.then((trips) => {
				const result = trips.map((t) => {
					return {
						tripId: t.trip.tripId,
						route: {shortName: t.trip.route.shortName},
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
		name: arrDep.stopName,
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
		name: arrDep.stopName,
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
