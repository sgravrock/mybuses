import { sortBy } from "../lib/sort";

describe("sortBy", function() {
	it("sorts by the return value of the selector", function() {
		const target = [
			{ x: 1 },
			{ x: 2 },
			{ x: 0 },
		];
		const expected = [
			{ x: 0 },
			{ x: 1 },
			{ x: 2 },
		];
		sortBy(target, item => item.x);
		expect(target).toEqual(expected);
	});
});
