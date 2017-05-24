/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
const vcr = require("./helpers/http-vcr");
import { Router } from "../lib/router";
import { Point, ArrivalAndDeparture, TripDetails, IObaClient } from "../lib/obaClient";

function makeStopsForLocationResponse(stopIds: string[]): string[] {
	return stopIds;
}

function makeArrDepResponse(tripIds: string[]) {
	return tripIds.map((tripId) => ({tripId: tripId}));
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

class StubObaClient implements IObaClient {
	stops: Map<string, Promise<string[]>>;
	arrDeps: Map<string, Promise<ArrivalAndDeparture[]>>;
	trips: Map<string, Promise<TripDetails>>;

	constructor() {
		this.stops = new Map();
		this.arrDeps = new Map();
		this.trips = new Map();
	}

	stopsForLocation(loc: Point): Promise<string[]> {
		return this._result("stopsForLocation", this.stops, JSON.stringify(loc));
	}

	arrivalsAndDeparturesForStop(stopId: string): Promise<ArrivalAndDeparture[]> {
		return this._result("arrivalsAndDeparturesForStop", this.arrDeps, stopId);
	}

	tripDetails(tripId: string): Promise<TripDetails> {
		return this._result("tripDetails", this.trips, tripId);
	}

	_result<T>(methodName: string, dict: Map<string, Promise<T>>, param: string): Promise<T> {
		const value = dict.get(param) || dict.get("any");

		if (value) {
			return value;
		} else {
			return Promise.reject("No " + methodName + " for " + param);
		}
	}
}

interface RouterSpecContext {
	obaClient: StubObaClient;
	subject: Router;
}

describe("Router", function() {
	describe("findTrips", function() {
		beforeEach(function(this: RouterSpecContext) {
			this.obaClient = new StubObaClient();
			this.subject = new Router({ obaClient: this.obaClient });
		});

		it("fails when either stopsForLocation call fails", function(this: RouterSpecContext) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			const error = new Error("nope");
			this.obaClient.stops.set(JSON.stringify(src), Promise.resolve({}));
			this.obaClient.stops.set(JSON.stringify(dest), Promise.reject(error));

			return verifyFails(this.subject.findTrips(src, dest), error);
		});

		it("fetches arrivals and departures for each source stop", async function(this: RouterSpecContext) {
			const payload = makeStopsForLocationResponse(["1_13760", "1_18165"]);
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.set(JSON.stringify(src), Promise.resolve(payload));
			this.obaClient.stops.set(JSON.stringify(dest), Promise.resolve([]));
			this.obaClient.arrDeps.set("any", Promise.resolve([]));
			spyOn(this.obaClient, "arrivalsAndDeparturesForStop");

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.arrivalsAndDeparturesForStop)
					.toHaveBeenCalledWith("1_13760");
			expect(this.obaClient.arrivalsAndDeparturesForStop)
					.toHaveBeenCalledWith("1_18165");
		});

		it("fails when an arrival and departure fetch fails", function(this: RouterSpecContext) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			const payload = makeStopsForLocationResponse(["1_13760"]);
			const error = new Error("nope");
			this.obaClient.stops.set("any", Promise.resolve(payload));
			this.obaClient.arrDeps.set("any", Promise.reject(error));

			return verifyFails(this.subject.findTrips(src, dest), error);
		});

		it("fetches trip details", async function(this: RouterSpecContext) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.set(JSON.stringify(src), Promise.resolve(
				makeStopsForLocationResponse(["src sid"])));
			this.obaClient.stops.set(JSON.stringify(dest), Promise.resolve(
				makeStopsForLocationResponse(["dest sid"])));

			this.obaClient.arrDeps.set("src sid", Promise.resolve([
				{ tripId: "12345", stopSequence: 1 },
				{ tripId: "67890", stopSequence: 1 },
			]));
			this.obaClient.arrDeps.set("dest sid", Promise.resolve([
				{ tripId: "12345", stopSequence: 2 },
				{ tripId: "67890", stopSequence: 2 },
			]));

			this.obaClient.trips.set("any", Promise.resolve({
				tripId: "any",
				route: {
					id: "any",
					shortName: "any"
				}
			}));
			spyOn(this.obaClient, "tripDetails").and.callThrough();

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("12345");
			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("67890");
		});

		it("provides trips that stop near both points", async function(this: RouterSpecContext) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.set(JSON.stringify(src), Promise.resolve(
				makeStopsForLocationResponse(["src sid", "src sid 2"])));
			this.obaClient.stops.set(JSON.stringify(dest), Promise.resolve(
				makeStopsForLocationResponse(["dest sid", "dest sid 2"])));

			this.obaClient.arrDeps.set("src sid", Promise.resolve([
				{ tripId: "12345", stopId: "src sid", stopSequence: 1 },
				{ tripId: "xyz", stopId: "src sid", stopSequence: 1 },
			]));
			this.obaClient.arrDeps.set("src sid 2", Promise.resolve([
				{ tripId: "12345", stopId: "src sid 2", stopSequence: 2 },
			]));
			this.obaClient.arrDeps.set("dest sid", Promise.resolve([
				{ tripId: "12345", stopId: "dest sid", stopSequence: 3 },
				{ tripId: "67890", stopId: "dest sid", stopSequence: 2 },
			]));
			this.obaClient.arrDeps.set("dest sid 2", Promise.resolve([
				{ tripId: "12345", stopId: "dest sid 2", stopSequence: 4 },
			]));

			const tripDetails = {
				tripId: "12345",
				route: {
					id: "5679",
					shortName: "Some route"
				}
			};
			this.obaClient.trips.set("12345", Promise.resolve(tripDetails));

			const result = await this.subject.findTrips(src, dest)
			expect(result).toEqual([{
				tripId: "12345",
				route: {
					id: "5679",
					shortName: "Some route"
				},
				srcStopIds: ["src sid", "src sid 2"],
				destStopIds: ["dest sid", "dest sid 2"],
			}]);
		});
	});

	describe("Integration", function() {
		beforeEach(function(this: RouterSpecContext) {
			const http = vcr.playback("spec/fixtures");
			http.stripParam("key");
			this.subject = new Router({
				http: http,
				key: "somekey"
			});
		});
	
		describe("findTrips", function() {
			it("finds trips between the two locations", async function(this: RouterSpecContext) {
				const expected = [
					{
						tripId: "1_33350305", 
						route: {
							id: "1_102572",
							shortName: "29"
						},
						srcStopIds: ["1_13760", "1_18150"],
						destStopIds: ["1_265", "1_300"],
					},
					{
						tripId: "1_33359811",
						route: {
							id: "1_102581",
							shortName: "D Line"
						},
						srcStopIds: ["1_13760"],
						destStopIds: ["1_420", "1_431", "1_468"],
					},
					{
						tripId: "1_33359163",
						route: {
							id: "1_102574",
							shortName: "40"
						},
						srcStopIds: ["1_18150", "1_18165", "1_28255"],
						destStopIds: ["1_420", "1_430", "1_450"],
					},
					{
						tripId: "1_33359653",
						route: {
							id: "1_102581",
							shortName: "D Line"
						},
						srcStopIds: ["1_13760"],
						destStopIds: ["1_420", "1_431", "1_468"]
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
