/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
const vcr = require("./helpers/http-vcr");
import { Router, Routing } from "../lib/router";
import { Point, ArrDep, TripDetails, IObaClient } from "../lib/obaClient";

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

// Works around an unfortunate type checking hole. TypeScript accepts this:
// const p: Promise<T> = Promise.resolve("totally not a T")
// By passing the payload through a typed interface before it gets to 
// Promise.resolve, we ensure that payloads get type checked.
class PromiseMap<T> {
	_map: Map<string, Promise<T>>;

	constructor() {
		this._map = new Map();
	}

	resolve(key: string, payload: T) {
		this._map.set(key, Promise.resolve(payload));
	}

	reject(key: string, error: any) {
		this._map.set(key, Promise.reject(error));
	}

	get(key: string): Promise<T> | undefined {
		return this._map.get(key);
	}
}

class StubObaClient implements IObaClient {
	stops: PromiseMap<string[]>;
	arrDeps: PromiseMap<ArrDep[]>;
	trips: PromiseMap<TripDetails>;

	constructor() {
		this.stops = new PromiseMap();
		this.arrDeps = new PromiseMap();
		this.trips = new PromiseMap();
	}

	stopsForLocation(loc: Point): Promise<string[]> {
		return this._result("stopsForLocation", this.stops, JSON.stringify(loc));
	}

	arrivalsAndDeparturesForStop(stopId: string): Promise<ArrDep[]> {
		return this._result("arrivalsAndDeparturesForStop", this.arrDeps, stopId);
	}

	tripDetails(tripId: string): Promise<TripDetails> {
		return this._result("tripDetails", this.trips, tripId);
	}

	_result<T>(methodName: string, dict: PromiseMap<T>, param: string): Promise<T> {
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
			this.obaClient.stops.resolve(JSON.stringify(src), []);
			this.obaClient.stops.reject(JSON.stringify(dest), error);

			return verifyFails(this.subject.findTrips(src, dest), error);
		});

		it("fetches arrivals and departures for each source stop", async function(this: RouterSpecContext) {
			const payload = makeStopsForLocationResponse(["1_13760", "1_18165"]);
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.resolve(JSON.stringify(src), payload);
			this.obaClient.stops.resolve(JSON.stringify(dest), []);
			this.obaClient.arrDeps.resolve("any", []);
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
			this.obaClient.stops.resolve("any", payload);
			this.obaClient.arrDeps.reject("any", error);

			return verifyFails(this.subject.findTrips(src, dest), error);
		});

		it("fetches trip details", async function(this: RouterSpecContext) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.resolve(JSON.stringify(src),
				makeStopsForLocationResponse(["src sid"]));
			this.obaClient.stops.resolve(JSON.stringify(dest),
				makeStopsForLocationResponse(["dest sid"]));

			this.obaClient.arrDeps.resolve("src sid", [
				{ tripId: "12345", stopId: "src sid", stopSequence: 1, lat: 0, lon: 0 },
				{ tripId: "67890", stopId: "src sid", stopSequence: 1, lat: 0, lon: 0 },
			]);
			this.obaClient.arrDeps.resolve("dest sid", [
				{ tripId: "12345", stopId: "dest sid", stopSequence: 2, lat: 0, lon: 0 },
				{ tripId: "67890", stopId: "dest sid", stopSequence: 2, lat: 0, lon: 0 },
			]);

			this.obaClient.trips.resolve("any", {
				tripId: "any",
				route: {
					id: "any",
					shortName: "any"
				}
			});
			spyOn(this.obaClient, "tripDetails").and.callThrough();

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("12345");
			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("67890");
		});

		it("provides trips that stop near both points", async function(this: RouterSpecContext) {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.resolve(JSON.stringify(src),
				makeStopsForLocationResponse(["src sid", "src sid 2"]));
			this.obaClient.stops.resolve(JSON.stringify(dest),
				makeStopsForLocationResponse(["dest sid", "dest sid 2"]));

			this.obaClient.arrDeps.resolve("src sid", [
				{ tripId: "12345", stopId: "src sid", stopSequence: 1, lat: 0, lon: 1 },
				{ tripId: "xyz", stopId: "src sid", stopSequence: 1, lat: 0, lon: 1 },
			]);
			this.obaClient.arrDeps.resolve("src sid 2", [
				{ tripId: "12345", stopId: "src sid 2", stopSequence: 2, lat: 1, lon: 2 },
			]);
			this.obaClient.arrDeps.resolve("dest sid", [
				{ tripId: "12345", stopId: "dest sid", stopSequence: 3, lat: 3, lon: 4 },
				{ tripId: "67890", stopId: "dest sid", stopSequence: 2, lat: 3, lon: 4 },
			]);
			this.obaClient.arrDeps.resolve("dest sid 2", [
				{ tripId: "12345", stopId: "dest sid 2", stopSequence: 4, lat: 5, lon: 6 },
			]);

			const tripDetails = {
				tripId: "12345",
				route: {
					id: "5679",
					shortName: "Some route"
				}
			};
			this.obaClient.trips.resolve("12345", tripDetails);

			const result = await this.subject.findTrips(src, dest)
			expect(result).toEqual([{
				tripId: "12345",
				route: {
					id: "5679",
					shortName: "Some route"
				},
				srcStops: [
					{ stopId: "src sid", location: { lat: 0, lon: 1 }, metersFromEndpoint: 12425667 },
					{ stopId: "src sid 2", location: { lat: 1, lon: 2 }, metersFromEndpoint: 12403734 },
				],
				destStops: [
					{ stopId: "dest sid", location: { lat: 3, lon: 4 }, metersFromEndpoint: 12355681 },
					{ stopId: "dest sid 2", location: { lat: 5, lon: 6 }, metersFromEndpoint: 12300786 },
				],
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
				const expected: Routing[] = [
					{
						tripId: "1_33350305", 
						route: {
							id: "1_102572",
							shortName: "29"
						},
						srcStops: [
							{
								stopId: "1_13760",
								location: { lat: 47.663143, lon: -122.37648 },
								metersFromEndpoint: 65,
							},
							{
								stopId: "1_18150",
								location: { lat: 47.665367, lon: -122.380714 },
								metersFromEndpoint: 393,
							},
						],
						destStops: [
							{
								stopId: "1_265",
								location: { lat: 47.611023, lon: -122.340706 },
								metersFromEndpoint: 256,
							},
							{
								stopId: "1_300",
								location: { lat: 47.608646, lon: -122.338432 },
								metersFromEndpoint: 134,
							},
						],
					},
					{
						tripId: "1_33359811",
						route: {
							id: "1_102581",
							shortName: "D Line"
						},
						srcStops: [
							{
								stopId: "1_13760",
								location: { lat: 47.663143, lon: -122.37648 },
								metersFromEndpoint: 65,
							},
						],
						destStops: [
							{
								stopId: "1_420",
								location: { lat: 47.612373, lon: -122.341019 },
								metersFromEndpoint: 375,
							},
							{
								stopId: "1_431",
								location: { lat: 47.609791, lon: -122.337959 },
								metersFromEndpoint: 10,
							},
							{
								stopId: "1_468",
								location: { lat: 47.606502, lon: -122.334938 },
								metersFromEndpoint: 424,
							},
						],
					},
					{
						tripId: "1_33359163",
						route: {
							id: "1_102574",
							shortName: "40"
						},
						srcStops: [
							{
								stopId: "1_18150",
								location: { lat: 47.665367, lon: -122.380714 },
								metersFromEndpoint: 393,
							},
							{
								stopId: "1_18165",
								location: { lat: 47.663593, lon: -122.375587 },
								metersFromEndpoint: 40,
							},
							{
								stopId: "1_28255",
								location: { lat: 47.66359, lon: -122.371025 },
								metersFromEndpoint: 381,
							}
						],
						destStops: [
							{
								stopId: "1_420",
								location: { lat: 47.612373, lon: -122.341019 },
								metersFromEndpoint: 375,
							},
							{
								stopId: '1_430',
								location: { lat: 47.61079, lon: -122.338875 },
								metersFromEndpoint: 137,
							},
							{
								stopId: '1_450',
								location: { lat: 47.60825, lon: -122.336548 },
								metersFromEndpoint: 195,
							},
						],
					},
					{
						tripId: "1_33359653",
						route: {
							id: "1_102581",
							shortName: "D Line"
						},
						srcStops: [
							{
								stopId: "1_13760",
								location: { lat: 47.663143, lon: -122.37648 },
								metersFromEndpoint: 65,
							},
						],
						destStops: [
							{
								stopId: "1_420",
								location: { lat: 47.612373, lon: -122.341019 },
								metersFromEndpoint: 375,
							},
							{
								stopId: "1_431",
								location: { lat: 47.609791, lon: -122.337959 },
								metersFromEndpoint: 10,
							},
							{
								stopId: "1_468",
								location: { lat: 47.606502, lon: -122.334938 },
								metersFromEndpoint: 424,
							},
						],
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
