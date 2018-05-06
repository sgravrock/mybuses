/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />
const vcr = require("./helpers/http-vcr");
import { Router, Routing, TimeType } from "../lib/router";
import { ObaClient } from "../lib/obaClient";
import { ObaRequest } from "../lib/obaRequest";
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
	beforeEach(function() {
		jasmine.clock().install();
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	describe("findTrips", function() {
		beforeEach(function(this: RouterSpecContext) {
			this.obaClient = new StubObaClient();
			this.subject = new Router(this.obaClient);
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
				{ tripId: "12345", stopId: "src sid", stopName: "", stopSequence: 1, scheduledArrivalTime: new Date(0), lat: 0, lon: 0 },
				{ tripId: "67890", stopId: "src sid", stopName: "", stopSequence: 1, scheduledArrivalTime: new Date(0), lat: 0, lon: 0 },
			]);
			this.obaClient.arrDeps.resolve("dest sid", [
				{ tripId: "12345", stopId: "dest sid", stopName: "", stopSequence: 2, scheduledArrivalTime: new Date(0), lat: 0, lon: 0 },
				{ tripId: "67890", stopId: "dest sid", stopName: "", stopSequence: 2, scheduledArrivalTime: new Date(0), lat: 0, lon: 0 },
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
			jasmine.clock().mockDate(new Date(0));
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.resolve(JSON.stringify(src),
				makeStopsForLocationResponse(["src sid", "src sid 2"]));
			this.obaClient.stops.resolve(JSON.stringify(dest),
				makeStopsForLocationResponse(["dest sid", "dest sid 2"]));

			this.obaClient.arrDeps.resolve("src sid", [
				{ tripId: "12345", stopId: "src sid", stopName: "src stop", stopSequence: 1, scheduledArrivalTime: new Date(0), lat: 0, lon: 1 },
				{ tripId: "xyz", stopId: "src sid", stopName: "src stop", stopSequence: 1, scheduledArrivalTime: new Date(0), lat: 0, lon: 1 },
			]);
			this.obaClient.arrDeps.resolve("src sid 2", [
				{ tripId: "12345", stopId: "src sid 2", stopName: "src stop 2", stopSequence: 2, scheduledArrivalTime: new Date(0), lat: 1, lon: 2 },
			]);
			this.obaClient.arrDeps.resolve("dest sid", [
				{ tripId: "12345", stopId: "dest sid", stopName: "dest stop", stopSequence: 3, scheduledArrivalTime: new Date(0), lat: 3, lon: 4 },
				{ tripId: "67890", stopId: "dest sid", stopName: "dest stop", stopSequence: 2, scheduledArrivalTime: new Date(0), lat: 3, lon: 4 },
			]);
			this.obaClient.arrDeps.resolve("dest sid 2", [
				{ tripId: "12345", stopId: "dest sid 2", stopName: "dest stop 2", stopSequence: 4, scheduledArrivalTime: new Date(0), lat: 5, lon: 6 },
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
				srcStop: {
					stopId: "src sid 2",
					name: "src stop 2",
					location: { lat: 1, lon: 2 },
					metersFromEndpoint: 12403734,
					arrivalTime: {
						minutesUntil: 0,
						type: TimeType.Scheduled,
					},
				},
				destStop: {
					stopId: "dest sid 2",
					name: "dest stop 2",
					location: { lat: 5, lon: 6 },
					metersFromEndpoint: 12300786,
					arrivalTime: {
						date: new Date(0),
						type: TimeType.Scheduled,
					},
				},
			}]);
		});

		it("provides predicted arrival times when available", async function(this: RouterSpecContext) {
			jasmine.clock().mockDate(new Date(0));
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stops.resolve(JSON.stringify(src),
				makeStopsForLocationResponse(["src sid"]));
			this.obaClient.stops.resolve(JSON.stringify(dest),
				makeStopsForLocationResponse(["dest sid"]));

			this.obaClient.arrDeps.resolve("src sid", [
				{ tripId: "12345", stopId: "src sid", stopName: "src stop", stopSequence: 1, scheduledArrivalTime: new Date(0), predictedArrivalTime: new Date(2 * 1000 * 60), lat: 0, lon: 1 },
			]);
			let destArrDate = new Date(3 * 1000 * 60);
			this.obaClient.arrDeps.resolve("dest sid", [
				{ tripId: "12345", stopId: "dest sid", stopName: "dest stop", stopSequence: 3, scheduledArrivalTime: new Date(0), predictedArrivalTime: destArrDate, lat: 3, lon: 4 },
			]);

			this.obaClient.trips.resolve("12345", {
				tripId: "12345",
				route: {
					id: "5679",
					shortName: "Some route"
				}
			});

			const result = await this.subject.findTrips(src, dest)
			const trip = result[0];
			expect(trip.srcStop.arrivalTime).toEqual({
				type: TimeType.Predicted,
				minutesUntil: 2
			});
			expect(trip.destStop.arrivalTime).toEqual({
				type: TimeType.Predicted,
				date: destArrDate,
			});
		});
	});

	describe("Integration", function() {
		beforeEach(function(this: RouterSpecContext) {
			jasmine.clock().mockDate(new Date(1494865686000));
		});
	
		describe("findTrips", function() {
			it("finds trips between the two locations", async function(this: RouterSpecContext) {
				const http = vcr.playback("spec/fixtures");
				http.stripParam("key");
				const obaClient = new ObaClient(new ObaRequest(http, "somekey"));
				this.subject = new Router(obaClient);

				const expected: Routing[] = [
					{
						tripId: "1_33359811",
						route: {
							id: "1_102581",
							shortName: "D Line"
						},
						srcStop: {
							stopId: "1_13760",
							name: "15th Ave NW & NW Leary Way",
							location: { lat: 47.663143, lon: -122.37648 },
							metersFromEndpoint: 65,
							arrivalTime: {
								minutesUntil: -4.4,
								type: TimeType.Scheduled,
							},
						},
						destStop: {
							stopId: "1_431",
							name: "3rd Ave & Pike St",
							location: { lat: 47.609791, lon: -122.337959 },
							metersFromEndpoint: 10,
							arrivalTime: {
								date: new Date(1494866937000),
								type: TimeType.Scheduled,
							},
						},
					},
					{
						tripId: "1_33350305", 
						route: {
							id: "1_102572",
							shortName: "29"
						},
						srcStop: {
							stopId: "1_13760",
							name: "15th Ave NW & NW Leary Way",
							location: { lat: 47.663143, lon: -122.37648 },
							metersFromEndpoint: 65,
							arrivalTime: {
								minutesUntil: -3,
								type: TimeType.Scheduled,
							},
						},
						destStop: {
							stopId: "1_300",
							name: "2nd Ave & Pike St",
							location: { lat: 47.608646, lon: -122.338432 },
							metersFromEndpoint: 134,
							arrivalTime: {
								date: new Date(1494867202000),
								type: TimeType.Scheduled,
							},
						},
					},
					{
						tripId: "1_33359163",
						route: {
							id: "1_102574",
							shortName: "40"
						},
						srcStop: {
							stopId: "1_18165",
							name: "NW Leary Way & 15th Ave NW",
							location: { lat: 47.663593, lon: -122.375587 },
							metersFromEndpoint: 40,
							arrivalTime: {
								minutesUntil: 0,
								type: TimeType.Scheduled,
							},
						},
						destStop: {
							stopId: '1_430',
							name: "3rd Ave & Pine St",
							location: { lat: 47.61079, lon: -122.338875 },
							metersFromEndpoint: 137,
							arrivalTime: {
								date: new Date(1494867336000),
								type: TimeType.Scheduled,
							},
						},
					},
					{
						tripId: "1_33359653",
						route: {
							id: "1_102581",
							shortName: "D Line"
						},
						srcStop: {
							stopId: "1_13760",
							name: "15th Ave NW & NW Leary Way",
							location: { lat: 47.663143, lon: -122.37648 },
							metersFromEndpoint: 65,
							arrivalTime: {
								minutesUntil: 5.6,
								type: TimeType.Scheduled,
							},
						},
						destStop: {
							stopId: "1_431",
							name: "3rd Ave & Pike St",
							location: { lat: 47.609791, lon: -122.337959 },
							metersFromEndpoint: 10,
							arrivalTime: {
								date: new Date(1494867537000),
								type: TimeType.Scheduled,
							},
						},
					}
				];

				const trips = await this.subject.findTrips(
					{lat: 47.663667, lon: -122.376109},
					{lat: 47.609776, lon: -122.337830}
				);
				expect(trips).toEqual(expected);
			});

			it("fails when any request fails", async function(this: RouterSpecContext) {
				const failureResponse = {
					on: (eventName: string, handler: any) => {
						if (eventName === "error") {
							handler(new Error("nope"));
						}
					}
				};
				const http = {get: () => failureResponse}
				const obaClient = new ObaClient(new ObaRequest(http, ""));
				this.subject = new Router(obaClient);

				try {
					await this.subject.findTrips(
						{lat: 47.663667, lon: -122.376109},
						{lat: 47.609776, lon: -122.337830}
					);
					throw new Error("Expected a rejection");
				} catch (e) {
					expect(e.message).toEqual("nope");
				}
			});
		});
	});
});
