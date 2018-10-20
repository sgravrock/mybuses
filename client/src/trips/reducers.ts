import {REQUEST_TRIPS, RECEIVE_TRIPS, RECEIVE_TRIPS_FAILED} from './actions';

export enum TripsLoadingState {
	NotStarted = 'not started',
	Loading = 'loading',
	Loaded = 'loaded',
	Failed = 'failed'
}


export interface TripsState {
	loadingState: TripsLoadingState;
	trips?: any[];
}

export function trips(state: TripsState = {loadingState: TripsLoadingState.NotStarted}, action: any): TripsState {
	switch (action.type) {
		case REQUEST_TRIPS:
			return {
				...state,
				loadingState: TripsLoadingState.Loading
			};

		case RECEIVE_TRIPS:
			return {
				...state,
				loadingState: TripsLoadingState.Loaded,
				trips: action.trips
			};

		case RECEIVE_TRIPS_FAILED:
			return {
				...state,
				loadingState: TripsLoadingState.Failed
			};

		default:
			return state;
	}
}
