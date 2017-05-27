"use strict";

import { ArrivalAndDeparture, TripDetails, Point } from "./obaClient";

type EndpointPair = [ArrivalAndDeparture, ArrivalAndDeparture];


export function groupEndpoints(srcArrDeps: ArrivalAndDeparture[],
		destArrDeps: ArrivalAndDeparture[]): EndpointPair[] {
	let result: EndpointPair[] = [];

	srcArrDeps.forEach(function(src) {
		destArrDeps.forEach(function(dest) {
			if (src.tripId === dest.tripId) {
				result.push([src, dest]);
			}
		});
	});

	return result;
}

export function excludeWrongWay(trips: EndpointPair[]): EndpointPair[] {
	return trips.filter(function([start, end]) {
		return start.stopSequence < end.stopSequence;
	});
}

export function groupEndpointPairsByTrip(pairs: EndpointPair[]): Map<string, EndpointPair[]> {
	const trips: Map<string, EndpointPair[]> = new Map();
	pairs.forEach((pair) => {
		const trip = trips.get(pair[0].tripId);

		if (trip) {
			trip.push(pair);
		} else {
			trips.set(pair[0].tripId, [pair]);
		}
	});

	return trips;
}
