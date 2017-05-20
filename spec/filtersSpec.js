"use strict";
const filters = require("../lib/filters");

describe("filters", function() {
	describe("groupEndpoints", function() {
		it("returns all same-trip endpoint pairs", function() {
			const srcArrDeps = [
				{ tripId: "1", stopSequence: 2 },
				{ tripId: "1", stopSequence: 3 },
				{ tripId: "2", stopSequence: 4 },
			];
			const destArrDeps = [
				{ tripId: "1", stopSequence: 1 },
				{ tripId: "1", stopSequence: 5 },
			];
			const expected = [
				[
					{ tripId: "1", stopSequence: 2 },
					{ tripId: "1", stopSequence: 1 },
				],
				[
					{ tripId: "1", stopSequence: 2 },
					{ tripId: "1", stopSequence: 5 },
				],
				[
					{ tripId: "1", stopSequence: 3 },
					{ tripId: "1", stopSequence: 1 },
				],
				[
					{ tripId: "1", stopSequence: 3 },
					{ tripId: "1", stopSequence: 5 },
				],
			];

			expect(filters.groupEndpoints(srcArrDeps, destArrDeps))
				.toEqual(expected);
		});
	});

	describe("excludeWrongWay", function() {
		it("excludes pairs that end before they start", function() {
			const trips = [
				[
					{ tripId: "1", stopSequence: 1 },
					{ tripId: "1", stopSequence: 2 },
				],
				[
					{ tripId: "2", stopSequence: 2 },
					{ tripId: "2", stopSequence: 1 },
				]
			];
			const expected = [
				[
					{ tripId: "1", stopSequence: 1 },
					{ tripId: "1", stopSequence: 2 },
				]
			];

			expect(filters.excludeWrongWay(trips)).toEqual(expected);
		});
	});
});
