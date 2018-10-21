import * as React from 'react';
import {mount} from 'enzyme';
import {TripsContainer} from './TripsContainer';
import {dummyPromise, stubMybusesApiClient, arbitraryTrip} from './testSupport/stubs';
import {MybusesApiContext} from "./mybuses";


describe('TripsContainer', () => {
	it('shows a loading indicator', () => {
		const subject = mountRender({});
		expect(subject.text()).toEqual('Searching for trips...');
	});

	it('fetches trips', () => {
		const apiClient = {
			trips: jasmine.createSpy('trips').and.returnValue(
				dummyPromise()
			)
		};
		mountRender({apiClient});
		expect(apiClient.trips).toHaveBeenCalledWith();
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

function mountRender(props: any) {
	const apiClient = props.apiClient || stubMybusesApiClient();
	const render = props.render || (() => <div />);

	return mount(
		<MybusesApiContext.Provider value={apiClient}>
			<TripsContainer render={render} />
		</MybusesApiContext.Provider>
	);
}
