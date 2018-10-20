import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk'
//import {createLogger} from 'redux-logger'
import {trips, TripsState} from './trips/reducers';
import {IApiClient} from "./mybuses";

export interface AppState {
	trips: TripsState
}

const rootReducer = combineReducers({trips});

export function configureStore(mybusesApiClient: IApiClient) {
	return createStore(
		rootReducer,
		applyMiddleware(
			//createLogger(),
			thunkMiddleware.withExtraArgument(mybusesApiClient)
		)
	);
}
