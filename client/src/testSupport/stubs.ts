import {AbsoluteTime, DestStop, RelativeTime, Route, SourceStop, Trip} from "../trips";

export function dummyPromise() {
	return new Promise(() => {});
}

export function stubMybusesApiClient() {
	return {
		trips: () => dummyPromise()
	};
}

export function arbitraryRoute(): Route {
	return {
		shortName: ""
	};
}

export function arbitrarySrcArrivalTime(): RelativeTime {
	return {
		minutesUntil: 0,
		isScheduled: false
	};
}

export function arbitrarySrcStop(): SourceStop {
	return {
		name: "",
		metersFromEndpoint: 0,
		arrivalTime: arbitrarySrcArrivalTime(),
	};
}

export function arbitraryDestArrivalTime(): AbsoluteTime {
	return {
		date: '1970-01-01T00:00:00.000Z',
		isScheduled: false
	};
}

export function arbitraryDestStop(): DestStop {
	return {
		name: "",
		metersFromEndpoint: 0,
		arrivalTime: arbitraryDestArrivalTime(),
	};
}

export function arbitraryTrip(): Trip {
	return {
		tripId: "",
		route: arbitraryRoute(),
		srcStop: arbitrarySrcStop(),
		destStop: arbitraryDestStop(),
	};
}

