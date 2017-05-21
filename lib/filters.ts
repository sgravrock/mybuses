"use strict";

function groupEndpoints(srcArrDeps: any[], destArrDeps: any[]): any[][] {
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

function excludeWrongWay(trips: any[]): any[] {
	return trips.filter(function([start, end]) {
		return start.stopSequence < end.stopSequence;
	});
}

module.exports = {
	groupEndpoints: groupEndpoints,
	excludeWrongWay: excludeWrongWay
};
