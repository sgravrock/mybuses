export const REQUEST_TRIPS = 'REQUEST_TRIPS';
export const RECEIVE_TRIPS = 'RECEIVE_TRIPS';
export const RECEIVE_TRIPS_FAILED = 'RECEIVE_TRIPS_FAILED';

export function fetchDefaultTrips() {
	return function(dispatch: any, getState: any, apiClient: any) {
		dispatch(requestTrips());
		apiClient.trips(null, null)
			.then(
				(trips: any) => dispatch(receiveTrips(trips)),
				(error: any) => dispatch(receiveTripsFailed())
			);
	}
}

function requestTrips() {
	return {type: REQUEST_TRIPS};
}

function receiveTrips(trips: any) {
	return {
		type: RECEIVE_TRIPS,
		trips: trips
	};
}

function receiveTripsFailed() {
	return {type: RECEIVE_TRIPS_FAILED};
}
