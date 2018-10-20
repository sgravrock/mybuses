import {Trip} from "./index";

export const REQUEST_TRIPS = 'REQUEST_TRIPS';
export const RECEIVE_TRIPS = 'RECEIVE_TRIPS';
export const RECEIVE_TRIPS_FAILED = 'RECEIVE_TRIPS_FAILED';

export function fetchDefaultTrips() {
	return function(dispatch: any, getState: any, apiClient: any) {
		dispatch(requestTrips());
		apiClient.trips()
			.then(
				(trips: Trip[]) => dispatch(receiveTrips(trips)),
				(error: Trip[]) => dispatch(receiveTripsFailed())
			);
	}
}

function requestTrips() {
	return {type: REQUEST_TRIPS};
}

function receiveTrips(trips: Trip[]) {
	return {
		type: RECEIVE_TRIPS,
		trips: trips
	};
}

function receiveTripsFailed() {
	return {type: RECEIVE_TRIPS_FAILED};
}
