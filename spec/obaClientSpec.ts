/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
import { ObaClient, ArrivalAndDeparture } from "../lib/obaClient";

interface SpecContext {
	get: jasmine.Spy,
	subject: ObaClient
}

describe("ObaClient", function() {
	beforeEach(function(this: SpecContext) {
		this.get = jasmine.createSpy("obaGet");
		this.subject = new ObaClient({ obaRequest: { get: this.get } });
	});

	describe("stopsForLocation", function() {
		function makePayload(stopIds: string[]) {
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

		it("gets the correct URL", async function(this: SpecContext) {
			const point = { lat: 47.635398, lon: -122.276930 };
			this.get.and.returnValue(Promise.resolve(makePayload([])));

			await this.subject.stopsForLocation(point);

			expect(this.get).toHaveBeenCalledWith(
				"/api/where/stops-for-location.json", point);
		});

		it("resolves to the stop IDs", async function(this: SpecContext) {
			this.get.and.returnValue(Promise.resolve(makePayload(["1", "2"])));
			const result = await this.subject.stopsForLocation({lat: 1, lon: 1});
			expect(result).toEqual(["1", "2"]);
		});
	});

	describe("arrivalsAndDeparturesForStop", function(this: SpecContext) {
		function makePayload(arrDeps: ArrivalAndDeparture[]) {
			return {
				data: {
					entry: {
						arrivalsAndDepartures: arrDeps
					}
				}
			}
		}

		it("gets the correct URL", async function(this: SpecContext) {
			this.get.and.returnValue(Promise.resolve(makePayload([])));
			const result = await this.subject.arrivalsAndDeparturesForStop("1_234");
			expect(this.get).toHaveBeenCalledWith(
				"/api/where/arrivals-and-departures-for-stop/1_234.json", {});
		});

		it("resolves to a list of trips", async function(this: SpecContext) {
			const arrDeps = [
				{
					tripId: "a",
					stopId: "1_234",
					stopSequence: 3
				},
				{
					tripId: "a",
					stopId: "1_234",
					stopSequence: 1
				},
			];
			this.get.and.returnValue(Promise.resolve(makePayload(arrDeps)));
			const result = await this.subject.arrivalsAndDeparturesForStop("1_234");
			expect(result).toEqual(arrDeps);
			expect(this.get).toHaveBeenCalledWith(
				"/api/where/arrivals-and-departures-for-stop/1_234.json", {});
		});
	});

	describe("tripDetails", function() {
		function makePayload(tripId: string, routeId: string, routeName: string) {
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

		it("gets the correct URL", async function(this: SpecContext) {
			this.get.and.returnValue(Promise.resolve(
				makePayload("abc", "route ID", "route name")));

			const result = await this.subject.tripDetails("abc")

			expect(this.get).toHaveBeenCalledWith(
				"/api/where/trip-details/abc.json", {});
		});

		it("resolves to a trip details structure", async function(this: SpecContext) {
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
