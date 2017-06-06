"use strict";

import * as wherePage from "../public/wherePage";

interface Context {
	dom: HTMLElement,
	geolocation: any
}

describe("Where page", function() {
	beforeEach(function(this: Context) {
		this.dom = document.createElement("div");
		this.dom.innerHTML = "<input name='srclon'><input name='srclat'>" +
			"<button class='use-current'>";
		this.geolocation = jasmine.createSpyObj("geolocation", ["getCurrentPosition"]);
		wherePage.init(this.dom, this.geolocation);
	});

	it("does not initially ask for the user's location", function(this: Context) {
		expect(this.geolocation.getCurrentPosition).not.toHaveBeenCalled();
	});

	describe("When the user clicks 'Use my location'", function() {
		beforeEach(function(this: Context) {
			const btn = this.dom.querySelector(".use-current") as HTMLInputElement;
			btn.click();
		});

		it("asks for the user's location", function(this: Context) {
			expect(this.geolocation.getCurrentPosition).toHaveBeenCalled();
		});

		it("disables the source inputs", function(this: Context) {
			const latField = this.dom.querySelector("[name=srclat]") as HTMLInputElement;
			const lonField = this.dom.querySelector("[name=srclon]") as HTMLInputElement;
			const btn = this.dom.querySelector(".use-current") as HTMLInputElement;

			expect(latField.disabled).toEqual(true);
			expect(lonField.disabled).toEqual(true);
			expect(btn.disabled).toEqual(true);
		});

		function verifiesInputsEnabled() {
			it("re-enables the source inputs", function(this: Context) {
				const latField = this.dom.querySelector("[name=srclat]") as HTMLInputElement;
				const lonField = this.dom.querySelector("[name=srclon]") as HTMLInputElement;
				const btn = this.dom.querySelector(".use-current") as HTMLInputElement;

				expect(latField.disabled).toEqual(false);
				expect(lonField.disabled).toEqual(false);
				expect(btn.disabled).toEqual(false);
			});
		};

		describe("When geolocation succeeds", function() {
			const position = {
				coords: {
					latitude: 47.89,
					longitude: -123.45
				}
			};

			beforeEach(function(this: Context) {
				this.geolocation.getCurrentPosition.calls.argsFor(0)[0](position);
			});

			it("fills in the starting coordinates", function(this: Context) {
				const latField = this.dom.querySelector("[name=srclat]") as HTMLInputElement;
				const lonField = this.dom.querySelector("[name=srclon]") as HTMLInputElement;
				expect(latField.value).toEqual("47.89");
				expect(lonField.value).toEqual("-123.45");
			});

			verifiesInputsEnabled();
		});
	
		describe("When geolocation fails with error 1", function() {
			const error = {
				code: 1,
				message: "you said nope"
			};

			beforeEach(function(this: Context) {
				this.geolocation.getCurrentPosition.calls.argsFor(0)[1](error);
			});

			it("does not display an error", function(this: Context) {
				const p = this.dom.querySelector(".error");
				expect(p).toBeFalsy();
			});

			verifiesInputsEnabled();
		});
	
		describe("When geolocation fails with another error", function() {
			const error = {
				code: 2,
				message: "nope"
			};

			beforeEach(function(this: Context) {
				this.geolocation.getCurrentPosition.calls.argsFor(0)[1](error);
			});

			it("displays an error", function(this: Context) {
				const p = this.dom.querySelector(".error");
				expect(p).toBeTruthy();
				expect(p!.textContent).toEqual("Could not find your location");
			});

			verifiesInputsEnabled();
		});
	});
});
