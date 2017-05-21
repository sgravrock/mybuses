"use strict";

function groupEndpoints(srcArrDeps, destArrDeps) {
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

function excludeWrongWay(trips) {
	return trips.filter(function([start, end]) {
		return start.stopSequence < end.stopSequence;
	});
}

module.exports = {
	groupEndpoints: groupEndpoints,
	excludeWrongWay: excludeWrongWay
};
