export function dummyPromise() {
	return new Promise(() => {});
}

export function stubMybusesApiClient() {
	return {
		trips: () => dummyPromise()
	};
}

export function arbitraryRoute() {
	return {
		id: "",
		shortName: ""
	};
}

export function arbitrarySrcArrivalTime() {
	return {
		minutesUntil: 0,
		type: 1,
		isScheduled: false
	};
}

export function arbitrarySrcStop() {
	return {
		stopId: "",
		name: "",
		location: {
			lat: 0,
			lon: 0
		},
		metersFromEndpoint: 0,
		arrivalTime: arbitrarySrcArrivalTime(),
	};
}

export function arbitraryDestArrivalTime() {
	return {
		date: '1970-01-01T00:00:00.000Z',
		type: 1,
		isScheduled: false
	};
}

export function arbitraryDestStop() {
	return {
		stopId: "",
		name: "",
		location: {
			lat: 0,
			lon: 0
		},
		metersFromEndpoint: 0,
		arrivalTime: arbitraryDestArrivalTime(),
	};
}

export function arbitraryTrip() {
	return {
		tripId: "",
		route: arbitraryRoute(),
		srcStop: arbitrarySrcStop(),
		destStop: arbitraryDestStop(),
	};
}

