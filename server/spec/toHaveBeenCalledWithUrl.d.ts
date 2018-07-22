declare module jasmine {
	interface Matchers<T> {
		toHaveBeenCalledWithUrl(actual: any): void;
	}
}