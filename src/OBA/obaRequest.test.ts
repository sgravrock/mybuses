/// <reference path="../testSupport/toHaveBeenCalledWithUrl.d.ts" />
import {ObaRequest} from "./obaRequest";
import {dummyPromise} from "../testSupport/stubs";
import {rejected} from "../testSupport/promise";

const parseUrl = require("url").parse;

type EventHandler = (...params: any[]) => void;

class MockResponse {
	statusCode?: number;
	_handlers: {[key:string]: EventHandler};

	constructor() {
		this._handlers = {};
	}

	on(event: string, handler: () => void) {
		this._handlers[event] = handler;
	}
}

interface Context {
	get: jasmine.Spy;
	subject: ObaRequest;
}

describe("ObaRequest", function() {
	beforeEach(function(this: Context) {
		this.get = jasmine.createSpy('get').and.returnValue(dummyPromise());
		this.subject = new ObaRequest({get: this.get}, "thekey");

		jasmine.addMatchers({
			toHaveBeenCalledWithUrl: function(util, customEqualityTesters) {
				return {
					compare: function(actual: any, expected: any) {
						if (actual.calls.count() === 0) {
							return {
								pass: false,
								message: "Expected spy " + actual.and.identity +
									" to have been called with a URL like " +
									jasmine.pp(expected) + " but it was never called."
							};
						} else if (actual.calls.count() !== 1) {
							return {
								pass: false,
								message: "Expected spy " + actual.and.identity +
									" to have been called with a URL like " +
									jasmine.pp(expected) +
									" but it was called more than once."
							};
						}

						const actualUrl = actual.calls.argsFor(0)[0];
						const actualParts = parseUrl(actualUrl, true);
						const actualSpec = {
							protocol: actualParts.protocol,
							host: actualParts.host,
							path: actualParts.pathname,
							query: actualParts.query
						};
						if (util.equals(actualSpec, expected)) {
							// This doesn't support negation.
							return { pass: true };
						} else {
							return {
								pass: false,
								message: "Expected spy " + actual.and.identity +
									" to have been called with a URL like " +
									jasmine.pp(expected) + " but it was called with " +
									jasmine.pp(actualSpec)
							};
						}
					}
				};
			}
		});

		jasmine.clock().install();
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	describe("get", function() {
		it("requests the correct URL", function(this: Context) {
			this.subject.get("/some/api.json", { foo: "bar" });
			expect(this.get).toHaveBeenCalledWithUrl({
				protocol: "http:",
				host: "api.pugetsound.onebusaway.org",
				path: "/some/api.json",
				query: { foo: "bar", key: "thekey" }
			});
		});

		it("encodes special characters in params", function(this: Context) {
			this.subject.get("/some/thing.json", { foo: "&? " });
			expect(this.get).toHaveBeenCalledWithUrl({
				protocol: "http:",
				host: "api.pugetsound.onebusaway.org",
				path: "/some/thing.json",
				query: { foo: "&? ", key: "thekey" }
			});
		});

		describe("When the request succeeds", function() {
			it("resolves to the provided payload", async function(this: Context) {
				const response = new MockResponse();
				response.statusCode = 200;
				this.get.and.returnValue(Promise.resolve({some: "json"}));

				const result = await this.subject.get("/whatever", {});

				expect(result).toEqual({some: "json"});
			});
		});

		describe("When the request fails", function() {
			it("rejects the promise", async function(this: Context) {
				this.get.and.returnValue(Promise.reject(new Error('nope')));
				await rejected(this.subject.get("/whatever", {}));
			});
		});
	});
});
