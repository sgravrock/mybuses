import {JsonpAdapter} from "./JsonpAdapter";
import {rejected} from "./testSupport/promise";

interface Context {
	dom: HTMLElement;
	subject: JsonpAdapter;
	_jsonpShim0: any;
	_jsonpShim1: any;
}

describe("JsonpAdapter", function() {
	beforeEach(function(this: Context) {
		this.dom = document.createElement("div");
		this.subject = new JsonpAdapter(this.dom, this);
	});

	it("creates a shim", function(this: Context) {
		expect(this._jsonpShim0).toBeFalsy(); // precondition
		this.subject.get('http://localhost/some.url');
		expect(this._jsonpShim0).toEqual(jasmine.any(Function));
	});

	it("adds a script tag with the specified url and the shim name", function(this: Context) {
		this.subject.get('http://localhost/some.url');
		const script = this.dom.querySelector("script");
		expect(script).toBeTruthy();
		expect(script!.src).toEqual('http://localhost/some.url?callback=_jsonpShim0');
	});

	it("appends the shim param to an existing query string", function(this: Context) {
		this.subject.get('http://localhost/some.url?foo=bar');
		const script = this.dom.querySelector("script");
		expect(script).toBeTruthy();
		expect(script!.src).toEqual('http://localhost/some.url?foo=bar&callback=_jsonpShim0');
	});

	describe("When the shim is called", function() {
		it("resolves the promise to the shim's argument", async function(this: Context) {
			const promise = this.subject.get('http://localhost/some.url');
			this._jsonpShim0('payload');
			const result = await promise;
			expect(result).toEqual('payload');
		});

		it("removes the shim", function(this: Context) {
			this.subject.get('http://localhost/some.url');
			this._jsonpShim0();
			expect(this._jsonpShim0).toBeFalsy();
		});
	});

	describe("When the created script tag fails to load", function() {
		it("rejects the promise", async function(this: Context) {
			const promise = this.subject.get('http://localhost/some.url');
			this.dom.querySelector("script")!.onerror('');
			const error = await rejected(promise);
			expect(error.message).toEqual("Failed to load http://localhost/some.url");
		});

		it("removes the shim", async function(this: Context) {
			const promise = this.subject.get('http://localhost/some.url');
			this.dom.querySelector("script")!.onerror('');
			await rejected(promise);
			expect(this._jsonpShim0).toBeFalsy();
		});
	});

	it("supports concurrent requests", async function(this: Context) {
		const promise0 = this.subject.get('http://localhost/some.url');
		expect(this._jsonpShim0).toBeTruthy();
		const promise1 = this.subject.get('http://localhost/some.url');
		expect(this._jsonpShim1).toBeTruthy();

		this._jsonpShim0('payload0');
		expect((await promise0)).toEqual('payload0');
		expect(this._jsonpShim0).toBeFalsy();

		this._jsonpShim1('payload1');
		expect((await promise1)).toEqual('payload1');
		expect(this._jsonpShim1).toBeFalsy();
	});
});
