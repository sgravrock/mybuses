export function dummyPromise() {
	return new Promise(() => {});
}

export function stubMybusesApiClient() {
	return {
		trips: () => dummyPromise()
	};
}

export function arbitraryTrip() {
	return {todo: 'figure out what goes here'};
}
