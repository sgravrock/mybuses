import { ArrDep } from "../OBA/obaClient";

type EndpointPair = [ArrDep, ArrDep];
type Indexer<T> = (thing: T) => any;


export function groupEndpoints(srcArrDeps: ArrDep[],
		destArrDeps: ArrDep[]): EndpointPair[] {
	const result: EndpointPair[] = [];

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

export function uniqueBy<T>(input: T[], indexer: Indexer<T>): T[] {
	const indices: any[] = [];
	return input.filter(x => {
		const ix = indexer(x);
		const include = indices.indexOf(ix) === -1;
		indices.push(ix);
		return include;
	});
}

interface HasDistance {
	metersFromEndpoint: number
}

export function nearest<T extends  HasDistance>(points: T[]): T {
	let result = points[0];

	for (let i = 1; i < points.length; i++) {
		if (points[i].metersFromEndpoint < result.metersFromEndpoint) {
			result = points[i];
		}
	}

	return result;
}
