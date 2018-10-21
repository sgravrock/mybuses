import * as filters from "./filters";
import { ArrDep } from "./obaClient";

describe("filters", function() {
	describe("groupEndpoints", function() {
		it("returns all same-trip endpoint pairs", function() {
			function makeArrDep(input: {tripId: string, stopSequence: number}): ArrDep {
				return {
					tripId: input.tripId,
					stopId: "",
					stopName: "",
					stopSequence: input.stopSequence,
					scheduledArrivalTime: new Date(0),
					lat: 0,
					lon: 0,
				};
			}
			const srcArrDeps = [
				makeArrDep({ tripId: "1", stopSequence: 2, }),
				makeArrDep({ tripId: "1", stopSequence: 3, }),
				makeArrDep({ tripId: "2", stopSequence: 4, }),
			];
			const destArrDeps = [
				makeArrDep({ tripId: "1", stopSequence: 1, }),
				makeArrDep({ tripId: "1", stopSequence: 5, }),
			];
			const expected: [ArrDep, ArrDep][] = [
				[
					makeArrDep({ tripId: "1", stopSequence: 2, }),
					makeArrDep({ tripId: "1", stopSequence: 1, }),
				],
				[
					makeArrDep({ tripId: "1", stopSequence: 2, }),
					makeArrDep({ tripId: "1", stopSequence: 5, }),
				],
				[
					makeArrDep({ tripId: "1", stopSequence: 3, }),
					makeArrDep({ tripId: "1", stopSequence: 1, }),
				],
				[
					makeArrDep({ tripId: "1", stopSequence: 3, }),
					makeArrDep({ tripId: "1", stopSequence: 5, }),
				],
			];

			expect(filters.groupEndpoints(srcArrDeps, destArrDeps))
				.toEqual(expected);
		});
	});

	describe("excludeWrongWay", function() {
		it("excludes pairs that end before they start", function() {
			function makeArrDep(input: {tripId: string, stopSequence: number}): ArrDep {
				return {
					tripId: input.tripId,
					stopId: "",
					stopName: "",
					stopSequence: input.stopSequence,
					scheduledArrivalTime: new Date(0),
					lat: 0,
					lon: 0,
				};
			}

			const trips: [ArrDep, ArrDep][]  = [
				[
					makeArrDep({ tripId: "1", stopSequence: 1 }),
					makeArrDep({ tripId: "1", stopSequence: 2 }),
				],
				[
					makeArrDep({ tripId: "2", stopSequence: 2 }),
					makeArrDep({ tripId: "2", stopSequence: 1 }),
				]
			];
			const expected: [ArrDep, ArrDep][]  = [
				[
					makeArrDep({ tripId: "1", stopSequence: 1 }),
					makeArrDep({ tripId: "1", stopSequence: 2 }),
				]
			];
			expect(filters.excludeWrongWay(trips)).toEqual(expected);
		});
	});

	describe("groupEndpointPairsByTrip", function() {
		it("groups same-trip endpoints into trips", function() {
			function makeArrDep(input: {tripId: string, stopId: string}): ArrDep {
				return {
					tripId: input.tripId,
					stopId: input.stopId,
					stopName: "",
					stopSequence: 0,
					scheduledArrivalTime: new Date(0),
					lat: 0,
					lon: 0,
				};
			}

			const pairs: [ArrDep, ArrDep][] = [
				[
					makeArrDep({ tripId: "1", stopId: "1" }),
					makeArrDep({ tripId: "1", stopId: "2" }),
				],
				[
					makeArrDep({ tripId: "1", stopId: "3" }),
					makeArrDep({ tripId: "1", stopId: "4" }),
				],
				[
					makeArrDep({ tripId: "2", stopId: "1" }),
					makeArrDep({ tripId: "2", stopId: "4" }),
				],
			];
			const expected = new Map();
			expected.set("1", [
				[
					makeArrDep({ tripId: "1", stopId: "1" }),
					makeArrDep({ tripId: "1", stopId: "2" }),
				],
				[
					makeArrDep({ tripId: "1", stopId: "3" }),
					makeArrDep({ tripId: "1", stopId: "4" }),
				],
			]);
			expected.set("2", [
				[
					makeArrDep({ tripId: "2", stopId: "1" }),
					makeArrDep({ tripId: "2", stopId: "4" }),
				]
			]);
			expect(filters.groupEndpointPairsByTrip(pairs)).toEqual(expected);
		});
	});

	describe("uniqueBy", function() {
		it("eliminates duplicates as indicated by the indexer", function() {
			const inputs = [
				{ foo: 1 },
				{ foo: 2 },
				{ foo: 1 }
			];
			const expected = [
				{ foo: 1 },
				{ foo: 2 },
			];
			expect(filters.uniqueBy(inputs, (x) => x.foo)).toEqual(expected);
		});
	});

	describe("nearest", function() {
		it("returns the stop closest to the endpoint", function() {
			const inputs = [
				{ metersFromEndpoint: 3 },
				{ metersFromEndpoint: 1 },
				{ metersFromEndpoint: 2 },
			];
			expect(filters.nearest(inputs)).toEqual({ metersFromEndpoint: 1});
		});
	});
});
