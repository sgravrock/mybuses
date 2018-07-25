import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk'
//import {createLogger} from 'redux-logger'
import {trips} from './trips/reducers';

const rootReducer = combineReducers({trips});

export function configureStore(mybusesApiClient: any) {
	return createStore(
		rootReducer,
		applyMiddleware(
			//createLogger(),
			thunkMiddleware.withExtraArgument(mybusesApiClient)
		)
	);
}
