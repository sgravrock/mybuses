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

	it("asks the router for trips", function(this: Context, done) {
		const response = jasmine.createSpyObj("response", ["status", "send"]);
		response.send.and.callFake(() => {
			expect(this.router.findTrips).toHaveBeenCalledWith(
				{ lat: 42, lon: -122 },
				{ lat: 41, lon: -123 }
			);
			done();
		});
		this.router.findTrips.and.returnValue(Promise.resolve([]));
		this.app.get.calls.argsFor(0)[1](null, response);
	});
});
