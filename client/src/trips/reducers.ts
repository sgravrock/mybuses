import {REQUEST_TRIPS, RECEIVE_TRIPS, RECEIVE_TRIPS_FAILED} from './actions';
import {Trip} from "./index";

export enum TripsLoadingState {
	NotStarted = 'not started',
	Loading = 'loading',
	Loaded = 'loaded',
	Failed = 'failed'
}


export interface TripsState {
	loadingState: TripsLoadingState;
	trips?: Trip[];
}

const defaultState = {loadingState: TripsLoadingState.NotStarted};

export function trips(state: TripsState = defaultState, action: any): TripsState {
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
