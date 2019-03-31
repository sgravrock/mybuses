import * as React from 'react';
import {mount} from 'enzyme';
import {TripsContainer} from './TripsContainer';
import {dummyPromise, stubMybusesApiClient, arbitraryTrip} from './testSupport/stubs';
import {DefaultRouterContext} from "./routing/default-router";
import {rejected} from "./testSupport/promise";


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
			const renderProp = jasmine.createSpy('render').and.returnValue(
				<div className="foo" />
			);
			const subject = mountRender({apiClient, render: renderProp});
			await promise;
			subject.update();

			expect(renderProp).toHaveBeenCalledWith(trips);
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

			expect(subject.text()).toEqual('Unable to find trips.');
		});
	});
});

function mountRender(props: any) {
	const apiClient = props.apiClient || stubMybusesApiClient();
	const renderProp = props.render || (() => <div />);

	return mount(
		<DefaultRouterContext.Provider value={apiClient}>
			<TripsContainer render={renderProp} />
		</DefaultRouterContext.Provider>
	);
}
