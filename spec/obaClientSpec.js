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

		it("gets the correct URL", async function() {
			const point = { lat: 47.635398, lon: -122.276930 };
			this.get.and.returnValue(Promise.resolve(makePayload([])));

			await this.subject.stopsForLocation(point);

			expect(this.get).toHaveBeenCalledWith(
				"/api/where/stops-for-location.json", point);
		});

		it("resolves to the stop IDs", async function() {
			this.get.and.returnValue(Promise.resolve(makePayload(["1", "2"])));
			const result = await this.subject.stopsForLocation({});
			expect(result).toEqual(["1", "2"]);
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

		it("gets the correct URL", async function() {
			this.get.and.returnValue(Promise.resolve(makePayload([])));
			const result = await this.subject.arrivalsAndDeparturesForStop("1_234");
			expect(this.get).toHaveBeenCalledWith(
				"/api/where/arrivals-and-departures-for-stop/1_234.json", {});
		});

		it("resolves to a list of trips", async function() {
			this.get.and.returnValue(Promise.resolve(makePayload(["a", "b"])));
			const result = await this.subject.arrivalsAndDeparturesForStop("1_234");
			expect(result).toEqual([
				{ tripId: "a" },
				{ tripId: "b" },
			]);
			expect(this.get).toHaveBeenCalledWith(
				"/api/where/arrivals-and-departures-for-stop/1_234.json", {});
		});
	});

	describe("tripDetails", function() {
		function makePayload(tripId, routeId, routeName) {
			return {
				data: {
					entry: {
						tripId: tripId
					},
					references: {
						routes: [
							{
								id: routeId,
								shortName: routeName
							}
						],
						trips: [
							{
								id: tripId,
								routeId: routeId
							}
						]
					}
				}
			};
		}

		it("gets the correct URL", async function() {
			this.get.and.returnValue(Promise.resolve(
				makePayload("abc")));

			const result = await this.subject.tripDetails("abc")

			expect(this.get).toHaveBeenCalledWith(
				"/api/where/trip-details/abc.json", {});
		});

		it("resolves to a trip details structure", async function() {
			this.get.and.returnValue(Promise.resolve(
				makePayload("abc", "routeId", "route name")));

			const result = await this.subject.tripDetails("abc");
			expect(result).toEqual({
				tripId: "abc",
				route: {
					id: "routeId",
					shortName: "route name"
				}
			});
		});
	});
});
