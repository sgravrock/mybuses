import * as React from 'react';
import {render} from 'react-testing-library'
import {TripsContainer} from './TripsContainer';
import {dummyPromise, stubMybusesApiClient, arbitraryTrip} from './testSupport/stubs';
import {DefaultRouterContext} from "./routing/default-router";
import {rejected} from "./testSupport/promise";


describe('TripsContainer', () => {
	it('shows a loading indicator', () => {
		const {container} = mountRender({});
		expect(container.textContent).toEqual('Searching for trips...');
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
			const {container} = mountRender({apiClient, render: renderProp});
			await promise;

			expect(renderProp).toHaveBeenCalledWith(trips);
			expect(container.querySelector('.foo')).toBeTruthy();
		});
	});

	describe('When fetching trips fails', () => {
		it('shows an error message', async () => {
			const promise = Promise.reject('nope');
			const apiClient = {
				trips: () => promise
			};
			const {container} = mountRender({apiClient});
			await rejected(promise);

			expect(container.textContent).toEqual('Unable to find trips.');
		});
	});
});

function mountRender(props: any) {
	const apiClient = props.apiClient || stubMybusesApiClient();
	const renderProp = props.render || (() => <div />);

	return render(
		<DefaultRouterContext.Provider value={apiClient}>
			<TripsContainer render={renderProp} />
		</DefaultRouterContext.Provider>
	);
}
