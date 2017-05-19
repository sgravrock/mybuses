"use strict";
const vcr = require("./helpers/http-vcr");
const Router = require("../lib/router");

function makeStopsForLocationResponse(stopIds) {
	return stopIds;
}

function makeArrDepResponse(tripIds) {
	return tripIds.map((tripId) => ({tripId: tripId}));
}

function makeTripDetailsResponse(tripId, stopIds) {
	return {
		tripId: tripId,
		stops: stopIds.map((stopId) => ({stopId: stopId}))
	};
}
 
function verifyFails(promise, error) {
	return promise.then(function () {
		throw new Error("Unexpected success");
	}, function(e) {
		expect(e).toEqual(error);
	});
}

function compareProperty(propname) {
	return function(a, b) {
		if (a[propname] < b[propname]) {
			return -1;
		} else if (a[propname] > b[propname]) {
			return 1;
		} else {
			return 0;
		}
	};
}

describe("Router", function() {
	describe("findTrips", function() {
		beforeEach(function() {
			this.obaClient = jasmine.createSpyObj("obaClient", [
				"stopsForLocation",
				"arrivalsAndDeparturesForStop",
				"tripDetails",
			]);
			this.subject = new Router({ obaClient: this.obaClient });
		});

		it("fetches stops near the endpoints", function() {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			this.obaClient.stopsForLocation.and.callFake(function(point) {
				return new Promise(function(resolve, reject) {});
			});
			
			this.subject.findTrips(src, dest)

			expect(this.obaClient.stopsForLocation).toHaveBeenCalledWith(src);
			expect(this.obaClient.stopsForLocation).toHaveBeenCalledWith(dest);
		});

		it("fails when either stopsForLocation call fails", function() {
			const src = {lat: 47.663667, lon: -122.376109};
			const dest = {lat: 47.609776, lon: -122.337830};
			const error = new Error("nope");
			this.obaClient.stopsForLocation.and.callFake(function(point) {
				return new Promise(function(resolve, reject) {
					if (point === src) {
						resolve({});
					} else {
						reject(error);
					}
				});
			});

			return verifyFails(this.subject.findTrips(src, dest), error);
		});

		it("fetches arrivals and departures for each source stop", async function() {
			const payload = makeStopsForLocationResponse(["1_13760", "1_18165"]);
			const src = {}, dest = {};
			this.obaClient.stopsForLocation.and.callFake(function(point) {
				return new Promise(function(resolve, reject) {
					resolve(point === src ? payload : []);
				});
			});
			this.obaClient.arrivalsAndDeparturesForStop.and.returnValue(
				Promise.resolve([]));

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.arrivalsAndDeparturesForStop)
					.toHaveBeenCalledWith("1_13760");
			expect(this.obaClient.arrivalsAndDeparturesForStop)
					.toHaveBeenCalledWith("1_18165");
		});

		it("fails when an arrival and departure fetch fails", function() {
			const payload = makeStopsForLocationResponse(["1_13760"]);
			const error = new Error("nope");
			this.obaClient.stopsForLocation.and.returnValue(
				Promise.resolve(payload));
			this.obaClient.arrivalsAndDeparturesForStop.and.returnValue(
				Promise.reject(error));

			return verifyFails(this.subject.findTrips({}, {}), error);
		});

		it("fetches trip details", async function() {
			const stopsPayload = makeStopsForLocationResponse(["1_13760"]);
			const arrDepPayload = makeArrDepResponse(["12345", "67890"]);
			this.obaClient.stopsForLocation.and.returnValue(
				Promise.resolve(stopsPayload));
			this.obaClient.arrivalsAndDeparturesForStop.and.returnValue(
				Promise.resolve(arrDepPayload));
			this.obaClient.tripDetails.and.returnValue(
				Promise.resolve({ stops: [] }));

			await this.subject.findTrips({}, {});

			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("12345");
			expect(this.obaClient.tripDetails).toHaveBeenCalledWith("67890");
		});

		it("does not fetch trips that only reach a stop on one end", async function() {
			const src = {}, dest = {};
			const srcStopsPayload = makeStopsForLocationResponse(["src sid"]);
			const destStopsPayload = makeStopsForLocationResponse(["dest sid"]);
			const srcArrDepPayload = makeArrDepResponse(["12345", "xyz"]);
			const destArrDepPayload = makeArrDepResponse(["12345", "67890"]);

			this.obaClient.stopsForLocation.and.callFake(function(point) {
				if (point === src) {
					return Promise.resolve(srcStopsPayload);
				} else {
					return Promise.resolve(destStopsPayload);
				}
			});

			this.obaClient.arrivalsAndDeparturesForStop.and.callFake(function(sid) {
				if (sid === "src sid") {
					return Promise.resolve(srcArrDepPayload);
				} else {
					return Promise.resolve(destArrDepPayload);
				}
			});

			this.obaClient.tripDetails.and.returnValue(
				Promise.resolve({ stops: [] }));

			await this.subject.findTrips(src, dest);

			expect(this.obaClient.tripDetails).not.toHaveBeenCalledWith("67890");
			expect(this.obaClient.tripDetails).not.toHaveBeenCalledWith("xyz");
		});

		it("provides trips that stop near both points", async function() {
			const src = {}, dest = {};
			const srcStopsPayload = makeStopsForLocationResponse(["src sid"]);
			const destStopsPayload = makeStopsForLocationResponse(["dest sid"]);
			const srcArrDepPayload = makeArrDepResponse(["12345", "xyz"]);
			const destArrDepPayload = makeArrDepResponse(["12345", "67890"]);

			this.obaClient.stopsForLocation.and.callFake(function(point) {
				if (point === src) {
					return Promise.resolve(srcStopsPayload);
				} else {
					return Promise.resolve(destStopsPayload);
				}
			});

			this.obaClient.arrivalsAndDeparturesForStop.and.callFake(function(sid) {
				if (sid === "src sid") {
					return Promise.resolve(srcArrDepPayload);
				} else {
					return Promise.resolve(destArrDepPayload);
				}
			});

			const trip = makeTripDetailsResponse("12345", ["src sid", "dest sid"]);
			this.obaClient.tripDetails.and.callFake(function(tripId) {
				if (tripId === "12345") {
					return Promise.resolve(trip);
				} else {
					return Promise.reject("Wrong trip ID");
				}
			});

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
		beforeEach(function() {
			const http = vcr.playback("spec/fixtures");
			http.stripParam("key");
			this.subject = new Router({
				http: http,
				key: "somekey"
			});
		});
	
		describe("findTrips", function() {
			it("finds trips between the two locations", async function() {
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
						},
					},
					{
						tripId: "1_33359714",
						route: {
							id: "1_102581",
							shortName: "D Line"
						}
					},
					{
						tripId: "1_33359101",
						route: {
							id: "1_102574",
							shortName: "40"
						}
					},
					{
						tripId: "1_33359872",
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
