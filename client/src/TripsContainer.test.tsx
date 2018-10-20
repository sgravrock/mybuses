import * as React from 'react';
import {Provider} from 'react-redux'
import {mount} from 'enzyme';
import {TripsContainer} from './TripsContainer';
import {dummyPromise, stubMybusesApiClient, arbitraryTrip} from './testSupport/stubs';
import {configureStore} from './store';
import {fetchDefaultTrips} from './trips/actions';

describe('TripsContainer', () => {
	it('shows a loading indicator', () => {
		const subject = mountRender({});
		expect(subject.text()).toEqual('Searching for trips...');
	});

	describe('When trips are not already being loaded', () => {
		it('fetches trips', () => {
			const apiClient = {
				trips: jasmine.createSpy('trips').and.returnValue(
					dummyPromise()
				)
			};
			mountRender({apiClient});
			expect(apiClient.trips).toHaveBeenCalledWith(null, null);
		});
	});

	describe('When trips are already being loaded', () => {
		it('does not fetch trips', () => {
			const apiClient = {
				trips: jasmine.createSpy('trips').and.returnValue(
					dummyPromise()
				)
			};
			mountRender(
				{apiClient},
				store => store.dispatch(fetchDefaultTrips())
			);
			expect(apiClient.trips).toHaveBeenCalledTimes(1);
		});
	});

	describe('When fetching trips succeeds', () => {
		it('renders the element returned by the render prop', async () => {
			const trips = [arbitraryTrip()];
			const promise = Promise.resolve(trips);
			const apiClient = {
				trips: () => promise
			};
			const render = jasmine.createSpy('render').and.returnValue(
				<div className="foo" />
			);
			const subject = mountRender({apiClient, render});
			await promise;
			subject.update();

			expect(render).toHaveBeenCalledWith(trips);
			expect(subject.find('.foo')).toExist();
		});
	});

	describe('When fetching trips fails', () => {
		it('shows an error message', async () => {
			const promise = Promise.reject('nope');
			const apiClient = {
				trips: () => promise
			};
			const subject = mountRender({apiClient});
			await rejected(promise);
			subject.update();

			expect(subject.text()).toEqual('Unable to find trips.');
		});
	});
});

async function rejected<T>(promise: Promise<T>) {
	try {
		await promise;
		throw new Error('Expected a rejection but did not get one');
	} catch (e) {
		// tslint:disable:no-empty
	}
}

function mountRender(props: any, prepareStore = (s: any) => {}) {
	const apiClient = props.apiClient || stubMybusesApiClient();
	const render = props.render || (() => <div />);
	const store = configureStore(apiClient);
	prepareStore(store);

	return mount(
		<Provider store={store}>
			<TripsContainer render={render} />
		</Provider>
	);
}
