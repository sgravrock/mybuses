"use strict";
const ObaClient = require("../obaClient");

describe("ObaClient", function() {
	beforeEach(function() {
		this.get = jasmine.createSpy("obaGet");
		this.subject = new ObaClient({ obaRequest: { get: this.get } });
	});

	describe("stopsForLocation", function() {
		function makePayload(stopIds) {
			return {
				data: {
					list: stopIds.map(function(stopId) {
						return {
							id: stopId,
							otherFields: "yes"
						};
					})
				}
			};
		}

		it("gets the correct URL", function() {
			const point = { lat: 47.635398, lon: -122.276930 };
			this.get.and.returnValue(Promise.resolve(makePayload([])));
			return this.subject.stopsForLocation(point)
				.then((result) => {
					expect(this.get).toHaveBeenCalledWith(
						"/api/where/stops-for-location.json", point);
				});
		});

		it("resolves to the stop IDs", function() {
			this.get.and.returnValue(Promise.resolve(makePayload(["1", "2"])));
			return this.subject.stopsForLocation({})
				.then((result) => expect(result).toEqual(["1", "2"]));
		});
	});

	describe("arrivalsAndDeparturesForStop", function() {
		function makePayload(tripIds) {
			return {
				data: {
					entry: {
						arrivalsAndDepartures: tripIds.map((tripId) => ({
							tripId: tripId,
							otherFields: "probably"
						}))
					}
				}
			}
		}

		it("gets the correct URL", function() {
			this.get.and.returnValue(Promise.resolve(makePayload([])));
			return this.subject.arrivalsAndDeparturesForStop("1_234")
				.then((result) => {
					expect(this.get).toHaveBeenCalledWith(
						"/api/where/arrivals-and-departures-for-stop/1_234.json", {});
				});
		});

		it("resolves to a list of trips", function() {
			this.get.and.returnValue(Promise.resolve(makePayload(["a", "b"])));
			return this.subject.arrivalsAndDeparturesForStop("1_234")
				.then((result) => {
					expect(result).toEqual([
						{ tripId: "a" },
						{ tripId: "b" },
					]);
					expect(this.get).toHaveBeenCalledWith(
						"/api/where/arrivals-and-departures-for-stop/1_234.json", {});
				});
		});
	});

	describe("tripDetails", function() {
		function makePayload(tripId, stopIds) {
			return {
				data: {
					entry: {
						tripId: tripId,
						schedule: {
							stopTimes: stopIds.map((stopId) => ({
								stopId: stopId,
								other: "sure"
							}))
						}
					}
				}
			};
		}

		it("gets the correct URL", function() {
			this.get.and.returnValue(Promise.resolve(
				makePayload("abc", [])));

			return this.subject.tripDetails("abc")
				.then((result) => {
					expect(this.get).toHaveBeenCalledWith(
						"/api/where/trip-details/abc.json", {});
				});
		});

		it("resolves to a trip details structure", function() {
			this.get.and.returnValue(Promise.resolve(
				makePayload("abc", ["1_2", "1_34"])));

			return this.subject.tripDetails("abc")
				.then((result) => {
					expect(result).toEqual({
						tripId: "abc",
						stops: [
							{ stopId: "1_2" },
							{ stopId: "1_34" },
						]
					});
				});
		});
	});
});
