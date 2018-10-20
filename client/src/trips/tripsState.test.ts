import {configureStore} from '../store';
import {fetchDefaultTrips} from './actions';
import {stubMybusesApiClient} from '../testSupport/stubs';
import {TripsLoadingState} from "./reducers";

describe('Trips state', () => {
	it('is initially not loaded', () => {
		const store = configureStore(stubMybusesApiClient());
		expect(store.getState().trips).toEqual({loadingState: TripsLoadingState.NotStarted});
	});

	describe('after a fetchDefaultTrips action', () => {
		it('triggers a fetch', () => {
			const apiClient = {
				trips: jasmine.createSpy('trips').and.returnValue(
					new Promise(() => {})
				)
			};
			const store = configureStore(apiClient);
			store.dispatch(fetchDefaultTrips());
			expect(apiClient.trips).toHaveBeenCalled();
		});

		it('is in the loading state', () => {
			const store = configureStore(stubMybusesApiClient());
			store.dispatch(fetchDefaultTrips());
			expect(store.getState().trips).toEqual({loadingState: TripsLoadingState.Loading});
		});
	});

	describe('after a fetch succeeds', () => {
		it('is in the loaded state', async () => {
			const trips = ['some trips'];
			const promise = Promise.resolve(trips);
			const apiClient = {trips: () => promise};
			const store = configureStore(apiClient);
			store.dispatch(fetchDefaultTrips());
			await promise;

			expect(store.getState().trips).toEqual({
				loadingState: TripsLoadingState.Loaded,
				trips
			});
		});
	});
	
	describe('after a fetch succeds', () => {
		it('is in the failed state', async () => {
			const promise = Promise.reject('nope');
			const apiClient = {trips: () => promise};
			const store = configureStore(apiClient);
			store.dispatch(fetchDefaultTrips());
			try { await promise; } catch(e) {}

			expect(store.getState().trips).toEqual({loadingState: TripsLoadingState.Failed});
		});
	});
});
