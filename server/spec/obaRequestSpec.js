"use strict";
const ObaRequest = require("../lib/obaRequest").ObaRequest;
const parseUrl = require("url").parse;

class MockResponse {
	constructor() {
		this._handlers = {};
	}

	on(event, handler) {
		this._handlers[event] = handler;
	}
}

function verifyFails(promise, error) {
	return promise.then(function () {
		throw new Error("Unexpected success");
	}, function(e) {
		expect(e).toEqual(error);
	});
}

describe("ObaRequest", function() {
	beforeEach(function() {
		this.get = jasmine.createSpy("get")
			.and.returnValue({
				on: () => {}
			});
		this.subject = new ObaRequest({ get: this.get }, "thekey");

		jasmine.addMatchers({
			toHaveBeenCalledWithUrl: function(util, customEqualityTesters) {
				return {
					compare: function(actual, expected) {
						if (actual.calls.count() === 0) {
							return {
								pass: false,
								message: "Expected spy " + actual.and.identity() +
									" to have been called with a URL like " +
									jasmine.pp(expected) + " but it was never called."
							};
						} else if (actual.calls.count() !== 1) {
							return {
								pass: false,
								message: "Expected spy " + actual.and.identity() +
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
								message: "Expected spy " + actual.and.identity() +
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
		it("requests the correct URL", function() {
			this.subject.get("/some/api.json", { foo: "bar" });
			expect(this.get).toHaveBeenCalledWithUrl({
				protocol: "http:",
				host: "api.pugetsound.onebusaway.org",
				path: "/some/api.json",
				query: { foo: "bar", key: "thekey" }
			});
		});

		it("encodes special characters in params", function() {
			this.subject.get("/some/thing.json", { foo: "&? " });
			expect(this.get).toHaveBeenCalledWithUrl({
				protocol: "http:",
				host: "api.pugetsound.onebusaway.org",
				path: "/some/thing.json",
				query: { foo: "&? ", key: "thekey" }
			});
		});

		describe("When the request succeeds", function() {
			it("resolves to the parsed JSON", async function() {
				const response = new MockResponse();
				response.statusCode = 200;
				this.get.and.callFake(function(url, callback) {
					setImmediate(function() {
						response._handlers["data"]('{"some"');
						response._handlers["data"](': "json"}');
						response._handlers["end"]();
					});

					callback(response);
					return {on: () => {}};
				});

				const result = await this.subject.get("/whatever", {});

				expect(result).toEqual({some: "json"});
			});

			describe("With code 429 in the payload", function() {
				it("tries the request again after a delay", async function() {
					const response = new MockResponse();
					response.statusCode = 200;
					spyOn(this.subject, "_getOnce").and.callThrough();
					let once = false;
					this.get.and.callFake(function(url, callback) {
						const payload = {};
						if (!once) {
							payload.code = 429;
						}
						once = true;

						setImmediate(function() {
							response._handlers["data"](JSON.stringify(payload));
							response._handlers["end"]();
						});
	
						callback(response);
						return {on: () => {}};
					});
	
					const resultPromise = this.subject.get("/whatever", {});

					await this.subject._getOnce.calls.first().returnValue;
					jasmine.clock().tick(500);

					await resultPromise;
					expect(this.get.calls.count()).toEqual(2);
				});
			});
		});

		describe("When the request fails to receive a response", function() {
			it("rejects the promise", async function() {
				this.get.and.returnValue({
					on: (eventName, handler) => {
						if (eventName === "error") {
							handler(new Error("nope"));
						}
					}
				});

				try {
					await this.subject.get("/whatever", {});
					throw new Error("promise was not rejected");
				} catch (e) {
					expect(e.message).toEqual("nope");
				}
			});
		});
	});
});
