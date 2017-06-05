import { Server } from "../lib/server";

interface Context {
	app: any;
	env: any;
	router: any;
	subject: Server;
};

describe("Server", function() {
	beforeEach(function(this: Context) {
		this.app = jasmine.createSpyObj("app", ["get", "listen"]);
		this.env = {
			PORT: "1234",
			SRC_LAT: "42",
			SRC_LON: "-122",
			DEST_LAT: "41",
			DEST_LON: "-123",
			OBA_API_KEY: "key",
		};
		this.router = jasmine.createSpyObj("router", ["findTrips"]);
		this.subject = new Server({
			app: this.app,
			env: this.env,
			router: this.router
		});
	});

	it("listens on the specified port", function(this: Context) {
		this.subject.start();
		expect(this.app.listen).toHaveBeenCalledWith(1234, jasmine.any(Function));
	});

	it("renders the correct template", function(this: Context) {
		this.router.findTrips.and.returnValue(Promise.resolve([]));
		return this.subject.tripsBetweenPoints({})
			.then(result => {
				expect(result.template).toEqual("./lib/index.mst");
			});
	});

	it("adds arrival timestamps", function(this: Context) {
		const trips = [
			{
				destStop: {
					scheduledArrivalTime: new Date(12345)
				}
			}
		];
		this.router.findTrips.and.returnValue(Promise.resolve(trips));
		return this.subject.tripsBetweenPoints({})
			.then(result => {
				expect(result.object.trips[0].destStop.arrivalTimestamp)
					.toEqual(12345);
			});
				
	});

	describe("When there are no query parameters", function() {
		it("uses the configured endpoints", function(this: Context, done) {
			const response = jasmine.createSpyObj("response", ["status", "send"]);
			response.send.and.callFake(() => {
				expect(this.router.findTrips).toHaveBeenCalledWith(
					{ lat: 42, lon: -122 },
					{ lat: 41, lon: -123 }
				);
				done();
			});
			this.router.findTrips.and.returnValue(Promise.resolve([]));
			this.app.get.calls.argsFor(0)[1]({ query: {} }, response);
		});
	});

	describe("When source parameters are specified", function() {
		it("uses the specified source", function(this: Context, done) {
			const request = {
				query: {
					srclat: "42.345",
					srclon: "-122.1"
				}
			};

			const response = jasmine.createSpyObj("response", ["status", "send"]);
			response.send.and.callFake(() => {
				expect(this.router.findTrips).toHaveBeenCalledWith(
					{ lat: 42.345, lon: -122.1 },
					{ lat: 41, lon: -123 }
				);
				done();
			});

			this.router.findTrips.and.returnValue(Promise.resolve([]));
			this.app.get.calls.argsFor(0)[1](request, response);
		});
	});

	describe("When destination parameters are specified", function() {
		it("uses the specified destination", function(this: Context, done) {
			const request = {
				query: {
					destlat: "42.345",
					destlon: "-122.1"
				}
			};

			const response = jasmine.createSpyObj("response", ["status", "send"]);
			response.send.and.callFake(() => {
				expect(this.router.findTrips).toHaveBeenCalledWith(
					{ lat: 42, lon: -122 },
					{ lat: 42.345, lon: -122.1 }
				);
				done();
			});

			this.router.findTrips.and.returnValue(Promise.resolve([]));
			this.app.get.calls.argsFor(0)[1](request, response);
		});
	});
});
