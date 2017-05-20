"use strict";
// @flow
import type {ArrivalAndDeparture} from "./types";


function groupEndpoints(srcArrDeps: Array<ArrivalAndDeparture>,
		destArrDeps: Array<ArrivalAndDeparture>):
		Array<[ArrivalAndDeparture, ArrivalAndDeparture]> {
	let result = [];

	srcArrDeps.forEach(function(src) {
		destArrDeps.forEach(function(dest) {
			if (src.tripId === dest.tripId) {
				result.push([src, dest]);
			}
		});
	});

	return result;
}

function excludeWrongWay(trips: Array<[ArrivalAndDeparture, ArrivalAndDeparture]>): Array<[ArrivalAndDeparture, ArrivalAndDeparture]> {
	return trips.filter(function([start, end]) {
		return start.stopSequence < end.stopSequence;
	});
}

module.exports = {
	groupEndpoints: groupEndpoints,
	excludeWrongWay: excludeWrongWay
};
