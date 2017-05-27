/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
import { uniqueBy } from "../lib/unique";

describe("uniqueBy", function() {
	it("eliminates duplicates as indicated by the indexer", function() {
		const inputs = [
			{ foo: 1 },
			{ foo: 2 },
			{ foo: 1 }
		];
		const expected = [
			{ foo: 1 },
			{ foo: 2 },
		];
		expect(uniqueBy(inputs, (x) => x.foo)).toEqual(expected);
	});
});
