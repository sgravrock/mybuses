// This contains just enough declarations to make Jasmine specs that use Flow
// pass the type checker.
type DoneCb = {
	(): void,
	fail: () => void
};

// This isn't exact -- it allows functions that both take callbacks and
// return promises -- but it avoids limitations in Flow's type inference
// that the more exact form hits.
type QueueableFnArg = empty | DoneCb;
type QueueableFnRet = Promise<any> | void;
type QueueableFn = QueueableFnArg => QueueableFnRet;

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: QueueableFn): void;
declare function beforeEach(fn: QueueableFn): void;
declare function afterEach(fn: QueueableFn): void;
declare function expect(arg: any): any;
declare function spyOn(target: any, fn: string): any;

declare var jasmine: {
	createSpy: (name: string) => any,
	clock: () => any,
	addMatchers: (matchers: {}) => void,
	pp: (arg: any) => string,
};
