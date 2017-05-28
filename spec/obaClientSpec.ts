/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
import { ObaClient, ArrDep } from "../lib/obaClient";

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
		function makePayload(stopId: string, stopName: string, lat: number, lon: number, arrDeps: ArrDep[]) {
			const stops = [
				{ id: "_", name: "", lat: -1, lon: -1, },
				{ id: stopId, name: stopName, lat: lat, lon: lon }
			];

			return {
				data: {
					entry: {
						arrivalsAndDepartures: arrDeps.map((arrDep) => {
							return {
								tripId: arrDep.tripId,
								stopId: arrDep.stopId,
								stopSequence: arrDep.stopSequence,
								scheduledArrivalTime: arrDep.scheduledArrivalTime.getTime(),
							};
						}),
					},
					references: {
						stops: stops
					},
				}
			}
		}

		it("gets the correct URL", async function(this: SpecContext) {
			this.get.and.returnValue(Promise.resolve(makePayload("1_234", "", 0, 0, [])));
			const result = await this.subject.arrivalsAndDeparturesForStop("1_234");
			expect(this.get).toHaveBeenCalledWith(
				"/api/where/arrivals-and-departures-for-stop/1_234.json", {
					minutesBefore: 2,
					minutesAfter: 60
				});
		});

		it("resolves to a list of arrivals/departures", async function(this: SpecContext) {
			const arrDeps = [
				{
					tripId: "a",
					stopId: "1_234",
					stopName: "The Stop",
					stopSequence: 3,
					scheduledArrivalTime: new Date(1),
					lat: 0,
					lon: 1,
				},
				{
					tripId: "a",
					stopId: "1_234",
					stopName: "The Stop",
					stopSequence: 1,
					scheduledArrivalTime: new Date(2),
					lat: 0,
					lon: 1,
				},
			];
			this.get.and.returnValue(Promise.resolve(makePayload("1_234", "The Stop", 0, 1, arrDeps)));
			const result = await this.subject.arrivalsAndDeparturesForStop("1_234");
			expect(result).toEqual(arrDeps);
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
