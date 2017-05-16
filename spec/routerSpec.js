"use strict";
const vcr = require("../http-vcr");
const Router = require("../router");

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

		it("fetches arrivals and departures for each source stop", function() {
			const payload = makeStopsForLocationResponse(["1_13760", "1_18165"]);
			const src = {}, dest = {};
			this.obaClient.stopsForLocation.and.callFake(function(point) {
				return new Promise(function(resolve, reject) {
					resolve(point === src ? payload : []);
				});
			});
			this.obaClient.arrivalsAndDeparturesForStop.and.returnValue(
				Promise.resolve([]));

			return this.subject.findTrips(src, dest)
				.then(() => {
					expect(this.obaClient.arrivalsAndDeparturesForStop)
							.toHaveBeenCalledWith("1_13760");
					expect(this.obaClient.arrivalsAndDeparturesForStop)
							.toHaveBeenCalledWith("1_18165");
				});
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

		it("fetches trip details", function() {
			const stopsPayload = makeStopsForLocationResponse(["1_13760"]);
			const arrDepPayload = makeArrDepResponse(["12345", "67890"]);
			this.obaClient.stopsForLocation.and.returnValue(
				Promise.resolve(stopsPayload));
			this.obaClient.arrivalsAndDeparturesForStop.and.returnValue(
				Promise.resolve(arrDepPayload));
			this.obaClient.tripDetails.and.returnValue(
				Promise.resolve({ stops: [] }));

			return this.subject.findTrips({}, {})
				.then(() => {
					expect(this.obaClient.tripDetails).toHaveBeenCalledWith("12345");
					expect(this.obaClient.tripDetails).toHaveBeenCalledWith("67890");
				});
		});

		it("does not fetch trips that only reach a stop on one end", function() {
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

			return this.subject.findTrips(src, dest)
				.then(() => {
					expect(this.obaClient.tripDetails)
						.not.toHaveBeenCalledWith("67890");
					expect(this.obaClient.tripDetails)
					.not.toHaveBeenCalledWith("xyz");
				});
		});

		it("provides trips that stop near both points", function() {
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

			return this.subject.findTrips(src, dest)
				.then(function(trips) {
					expect(trips).toEqual([{
						tripId: "12345",
						stops: [
							{ stopId: "src sid" },
							{ stopId: "dest sid" }
						]
					}]);
				});
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
			it("finds trips between the two locations", function() {
				const expected = [
					"1_33350305",
					"1_33359811",
					"1_33359163",
					"1_33359653",
					"1_33359714",
					"1_33359101",
					"1_33359872",
				].sort();
				return this.subject.findTrips(
					{lat: 47.663667, lon: -122.376109},
					{lat: 47.609776, lon: -122.337830}
				).then(function(trips) {
					const tripIds = trips.map((t) => t.tripId).sort();
					expect(tripIds).toEqual(expected);
				});
			});
		});
	});
});
