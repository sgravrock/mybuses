import {REQUEST_TRIPS, RECEIVE_TRIPS, RECEIVE_TRIPS_FAILED} from './actions';

export interface TripsState {
	loadingState: string;
	trips?: any[];
}

export function trips(state: TripsState = {loadingState: 'not started'}, action: any): TripsState {
	switch (action.type) {
		case REQUEST_TRIPS:
			return {
				...state,
				loadingState: 'loading'
			};

		case RECEIVE_TRIPS:
			return {
				...state,
				loadingState: 'loaded',
				trips: action.trips
			};

		case RECEIVE_TRIPS_FAILED:
			return {
				...state,
				loadingState: 'failed'
			};

		default:
			return state;
	}
}
