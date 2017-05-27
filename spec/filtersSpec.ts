"use strict";
import * as filters from "../lib/filters";
import { ArrivalAndDeparture } from "../lib/obaClient";

describe("filters", function() {
	describe("groupEndpoints", function() {
		it("returns all same-trip endpoint pairs", function() {
			function makeArrDep(input: {tripId: string, stopSequence: number}): ArrivalAndDeparture {
				return {
					tripId: input.tripId,
					stopId: "",
					stopSequence: input.stopSequence,
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
			const expected: [ArrivalAndDeparture, ArrivalAndDeparture][] = [
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
			function makeArrDep(input: {tripId: string, stopSequence: number}): ArrivalAndDeparture {
				return {
					tripId: input.tripId,
					stopId: "",
					stopSequence: input.stopSequence,
					lat: 0,
					lon: 0,
				};
			}

			const trips: [ArrivalAndDeparture, ArrivalAndDeparture][]  = [
				[
					makeArrDep({ tripId: "1", stopSequence: 1 }),
					makeArrDep({ tripId: "1", stopSequence: 2 }),
				],
				[
					makeArrDep({ tripId: "2", stopSequence: 2 }),
					makeArrDep({ tripId: "2", stopSequence: 1 }),
				]
			];
			const expected: [ArrivalAndDeparture, ArrivalAndDeparture][]  = [
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
			function makeArrDep(input: {tripId: string, stopId: string}): ArrivalAndDeparture {
				return {
					tripId: input.tripId,
					stopId: input.stopId,
					stopSequence: 0,
					lat: 0,
					lon: 0,
				};
			}

			const pairs: [ArrivalAndDeparture, ArrivalAndDeparture][] = [
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
						[
							makeArrDep({ tripId: "2", stopId: "1" }),
							makeArrDep({ tripId: "2", stopId: "4" }),
						],
					]
				]);;
			expect(filters.groupEndpointPairsByTrip(pairs)).toEqual(expected);
		});
	});
});
