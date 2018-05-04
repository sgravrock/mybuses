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

export function arbitraryArrivalTime() {
	return {
		minutesUntil: 0,
		type: 1,
		isScheduled: false
	};
}

export function arbitraryStop() {
	return {
		stopId: "",
		name: "",
		location: {
			lat: 0,
			lon: 0
		},
		metersFromEndpoint: 0,
		arrivalTime: {
			minutesUntil: 0,
			type: 1,
			isScheduled: false
		}
	};
}

export function arbitraryTrip() {
	return {
		tripId: "",
		route: arbitraryRoute(),
		srcStop: arbitraryStop(),
		destStop: arbitraryStop(),
	};
}

