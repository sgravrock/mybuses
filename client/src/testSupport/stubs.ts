import {AbsoluteTime, DestStop, RelativeTime, Route, SourceStop, Trip} from "../trips";
import {IApiClient} from "../mybuses";

export function dummyPromise<T = any>(): Promise<T> {
	return new Promise<T>(() => {});
}

export function stubMybusesApiClient(): IApiClient {
	return {
		trips: () => dummyPromise<Trip[]>()
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

