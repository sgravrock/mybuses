"use strict";

import { ArrivalAndDeparture } from "./obaClient";

function groupEndpoints(srcArrDeps: ArrivalAndDeparture[],
		destArrDeps: ArrivalAndDeparture[]):
		ArrivalAndDeparture[][] {
	let result: any[][] = [];

	srcArrDeps.forEach(function(src) {
		destArrDeps.forEach(function(dest) {
			if (src.tripId === dest.tripId) {
				result.push([src, dest]);
			}
		});
	});

	return result;
}

function excludeWrongWay(trips: [ArrivalAndDeparture, ArrivalAndDeparture][]): [ArrivalAndDeparture, ArrivalAndDeparture][] {
	return trips.filter(function([start, end]) {
		return start.stopSequence < end.stopSequence;
	});
}

module.exports = {
	groupEndpoints: groupEndpoints,
	excludeWrongWay: excludeWrongWay
};
