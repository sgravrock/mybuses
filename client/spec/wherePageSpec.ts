"use strict";

import * as wherePage from "../public/wherePage";

interface Context {
	dom: HTMLElement,
	geolocation: any
}

describe("Where page", function() {
	beforeEach(function(this: Context) {
		this.dom = document.createElement("div");
		this.dom.innerHTML = "<input name='srclon'><input name='srclat'>";
		this.geolocation = jasmine.createSpyObj("geolocation", ["getCurrentPosition"]);
		wherePage.init(this.dom, this.geolocation);
	});

	describe("When geolocation succeeds", function() {
		it("fills in the starting coordinates", function(this: Context) {
			const position = {
				coords: {
					latitude: 47.89,
					longitude: -123.45
				}
			};
			this.geolocation.getCurrentPosition.calls.argsFor(0)[0](position);
			const latField = this.dom.querySelector("[name=srclat]") as HTMLInputElement;
			const lonField = this.dom.querySelector("[name=srclon]") as HTMLInputElement;
			expect(latField.value).toEqual("47.89");
			expect(lonField.value).toEqual("-123.45");
		});
	});

	describe("When geolocation fails with error 1", function() {
		it("does not display an error", function(this: Context) {
			const error = {
				code: 1,
				message: "you said nope"
			};
			this.geolocation.getCurrentPosition.calls.argsFor(0)[1](error);
			const p = this.dom.querySelector(".error");
			expect(p).toBeFalsy();
		});
	});

	describe("When geolocation fails with another error", function() {
		it("displays an error", function(this: Context) {
			const error = {
				code: 2,
				message: "nope"
			};
			this.geolocation.getCurrentPosition.calls.argsFor(0)[1](error);
			const p = this.dom.querySelector(".error");
			expect(p).toBeTruthy();
			expect(p!.textContent).toEqual("Could not find your location");
		});
	});
});
