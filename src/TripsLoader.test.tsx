import * as React from 'react';
import {mount} from 'enzyme';
import {TripsLoader, TripsLoaderChildProps} from './TripsLoader';
import {dummyPromise, stubMybusesApiClient, arbitraryTrip} from './testSupport/stubs';
import {DefaultRouterContext} from "./routing/default-router";
import {rejected} from "./testSupport/promise";


describe('TripsLoader', () => {
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

			expect(renderProp).toHaveBeenCalledWith({
				trips,
				reload: jasmine.any(Function)
			});
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

	describe('When the reload callback is called', () => {
		it('reloads trips', async function() {
			const promise = Promise.resolve([]);
			const apiClient = {
				trips: jasmine.createSpy('trips').and.returnValue(promise)
			};
			let reload: () => void;
			const renderProp = (props: TripsLoaderChildProps) => {
				reload = props.reload;
				return 'some text';
			};
			const subject = mountRender({apiClient, render: renderProp});
			await promise;

			apiClient.trips.calls.reset();
			reload();
			subject.update();

			expect(apiClient.trips).toHaveBeenCalledWith();
			expect(subject.text()).toEqual('Searching for trips...');
		});
	});
});

function mountRender(props: any) {
	const apiClient = props.apiClient || stubMybusesApiClient();
	const renderProp = props.render || (() => <div />);

	return mount(
		<DefaultRouterContext.Provider value={apiClient}>
			<TripsLoader render={renderProp} />
		</DefaultRouterContext.Provider>
	);
}
