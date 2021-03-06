import {AbsoluteTime, DestStop, Route, SourceStop, Trip} from "../trips";
import {IDefaultRouter} from "../routing/default-router";
import {TimeType} from "../trips";
import {Point} from "../OBA/obaClient";

export function dummyPromise<T = any>(): Promise<T> {
	return new Promise<T>(() => {});
}

export function stubMybusesApiClient(): IDefaultRouter {
	return {
		trips: () => dummyPromise<Trip[]>()
	};
}

export function arbitraryRoute(): Route {
	return {
		shortName: ""
	};
}

export function arbitrarySrcArrivalTime(): AbsoluteTime {
	return {
		date: new Date(0),
		type: TimeType.Predicted
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
		date: new Date('1970-01-01T00:00:00.000Z'),
		type: TimeType.Predicted
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

export function arbitraryPoint(): Point {
	return {
		lat: 0,
		lon: 0
	};
}