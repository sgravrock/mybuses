import {REQUEST_TRIPS, RECEIVE_TRIPS, RECEIVE_TRIPS_FAILED} from './actions';

export function trips(state = {loadingState: 'not started'}, action: any) {
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
