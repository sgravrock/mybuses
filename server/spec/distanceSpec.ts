import { distanceInMeters } from "../lib/distance";

describe("distanceInMeters", function() {
	it("returns the distance in meters between two points", function() {
		const p1 = { lat: 47.612373, lon: -122.341019 };
		const p2 = { lat: 47.609776, lon: -122.337830 };
		expect(distanceInMeters(p1, p2)).toBeCloseTo(375, 0);
	});
});
