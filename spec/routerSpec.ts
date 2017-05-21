/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
"use strict";
const vcr = require("./helpers/http-vcr");
const Router = require("../lib/router").Router;
import { Point } from "../lib/obaClient";

function makeStopsForLocationResponse(stopIds: string[]): string[] {
	return stopIds;
}

function makeArrDepResponse(tripIds: string[]) {
	return tripIds.map((tripId) => ({tripId: tripId}));
}

function makeTripDetailsResponse(tripId: string, stopIds: string[]) {
	return {
		tripId: tripId,
		stops: stopIds.map((stopId) => ({stopId: stopId}))
	};
}
 
function verifyFails(promise: Promise<any>, error: any): Promise<void> {
	return promise.then(function () {
		throw new Error("Unexpected success");
	}, function(e) {
		expect(e).toEqual(error);
	});
}

function compareProperty(propname: string) {
	return function(a: any, b: any): number {
		if (a[propname] < b[propname]) {
			return -1;
		} else if (a[propname] > b[propname]) {
			return 1;
		} else {
			return 0;
		}
	};
}

class StubObaClient {
	stops: object;
	arrDeps: object;
	trips: object;

	constructor() {
		this.stops = {};
		this.arrDeps = {};
		this.trips = {};
	}

	stopsForLocation(loc: Point) {
		return this._result("stopsForLocation", this.stops, JSON.stringify(loc));
	}

	arrivalsAndDeparturesForStop(stopId: string) {
		return this._result("arrivalsAndDeparturesForStop", this.arrDeps, stopId);
	}

	tripDetails(tripId: string) {
		return this._result("tripDetails", this.trips, tripId);
	}

	_result(methodName: string, dict: any, param: string) {
		if (dict[param]) {
			return dict[param];
		} else if (dict.any) {
			return dict.any;
		} else {
			return Promise.reject("No " + methodName + " for " + param);
		}
	}
}

describe("Router", function() {
	describe("findTrips", function() {
		beforeEach(function(this: any) {
			this.obaClient = new StubObaClient();
			this.subject = new Router({ obaClient: this.obaClient });
		});

		it("fails when either stopsForLocation call fails", function(this: any) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			const error = new Error("nope");
			this.obaClient.stops[JSON.stringify(src)] = Promise.resolve({});
			this.obaClient.stops[JSON.stringify(dest)] = Promise.reject(error);

			return verifyFails(this.subject.findTrips(src, dest), error);
		});

		it("fetches arrivals and departures for each source stop", async function(this: any) {
			const payload = makeStopsForLocationResponse(["1_13760", "1_18165"]);
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops[JSON.stringify(src)] = Promise.resolve(payload);
			this.obaClient.stops[JSON.stringify(dest)] = Promise.resolve([]);
			this.obaClient.arrDeps.any = Promise.resolve([]);
			spyOn(this.obaClient, "arrivalsAndDeparturesForStop");

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.arrivalsAndDeparturesForStop)
					.toHaveBeenCalledWith("1_13760");
			expect(this.obaClient.arrivalsAndDeparturesForStop)
					.toHaveBeenCalledWith("1_18165");
		});

		it("fails when an arrival and departure fetch fails", function(this: any) {
			const payload = makeStopsForLocationResponse(["1_13760"]);
			const error = new Error("nope");
			this.obaClient.stops.any = Promise.resolve(payload);
			this.obaClient.arrDeps.any = Promise.reject(error);

			return verifyFails(this.subject.findTrips({}, {}), error);
		});

		it("fetches trip details", async function(this: any) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops[JSON.stringify(src)] = Promise.resolve(
				makeStopsForLocationResponse(["src sid"]));
			this.obaClient.stops[JSON.stringify(dest)] = Promise.resolve(
				makeStopsForLocationResponse(["dest sid"]));

			this.obaClient.arrDeps["src sid"] = Promise.resolve([
				{ tripId: "12345", stopSequence: 1 },
				{ tripId: "67890", stopSequence: 1 },
			]);
			this.obaClient.arrDeps["dest sid"] = Promise.resolve([
				{ tripId: "12345", stopSequence: 2 },
				{ tripId: "67890", stopSequence: 2 },
			]);

			this.obaClient.trips.any = Promise.resolve({ stops: [] });
			spyOn(this.obaClient, "tripDetails");

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("12345");
			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("67890");
		});

		it("provides trips that stop near both points", async function(this: any) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops[JSON.stringify(src)] = Promise.resolve(
				makeStopsForLocationResponse(["src sid"]));
			this.obaClient.stops[JSON.stringify(dest)] = Promise.resolve(
				makeStopsForLocationResponse(["dest sid"]));

			this.obaClient.arrDeps["src sid"] = Promise.resolve([
				{ tripId: "12345", stopSequence: 1 },
				{ tripId: "xyz", stopSequence: 1 },
			]);
			this.obaClient.arrDeps["dest sid"] = Promise.resolve([
				{ tripId: "12345", stopSequence: 2 },
				{ tripId: "67890", stopSequence: 2 },
			]);

			this.obaClient.trips["12345"] = Promise.resolve(
				makeTripDetailsResponse("12345", ["src sid", "dest sid"]));

			const result = await this.subject.findTrips(src, dest)
			expect(result).toEqual([{
				tripId: "12345",
				stops: [
					{ stopId: "src sid" },
					{ stopId: "dest sid" }
				]
			}]);
		});
	});

	describe("Integration", function() {
		beforeEach(function(this: any) {
			const http = vcr.playback("spec/fixtures");
			http.stripParam("key");
			this.subject = new Router({
				http: http,
				key: "somekey"
			});
		});
	
		describe("findTrips", function() {
			it("finds trips between the two locations", async function(this: any) {
				const expected = [
					{
						tripId: "1_33350305", 
						route: {
							id: "1_102572",
							shortName: "29"
						}
					},
					{
						tripId: "1_33359811",
						route: {
							id: "1_102581",
							shortName: "D Line"
						}
					},
					{
						tripId: "1_33359163",
						route: {
							id: "1_102574",
							shortName: "40"
						}
					},
					{
						tripId: "1_33359653",
						route: {
							id: "1_102581",
							shortName: "D Line"
						}
					}
				].sort(compareProperty("tripId"));

				const trips = await this.subject.findTrips(
					{lat: 47.663667, lon: -122.376109},
					{lat: 47.609776, lon: -122.337830}
				)
				trips.sort(compareProperty("tripId"));
				expect(trips).toEqual(expected);
			});
		});
	});
});
