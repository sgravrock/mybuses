"use strict";
const stripParam = require("../lib/stripParam");

describe("stripParam", function() {
	it("removes the param when it is first", function() {
		expect(stripParam("/path?foo=bar&baz=qux", "foo")).toEqual("/path?baz=qux");
	});

	it("removes the param when it is last", function() {
		expect(stripParam("/path?foo=bar&baz=qux", "baz")).toEqual("/path?foo=bar");
	});

	it("removes the param when it is in the middle", function() {
		expect(stripParam("/path?foo=bar&baz=qux&grault=fido", "baz"))
			.toEqual("/path?foo=bar&grault=fido");
	});

	it("removes the only param", function() {
		expect(stripParam("/path?foo=bar", "foo")).toEqual("/path");
	});
});
