import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux'
import {mount} from 'enzyme';
import {TripsContainer} from './TripsContainer';
import {dummyPromise, stubMybusesApiClient} from './stubs';
import {configureStore} from './store';

describe('TripsContainer', () => {
	it('shows a loading indicator', () => {
		const subject = mountRender({});
		expect(subject.text()).toEqual('Searching for trips...');
	});

	it('fetches trips', () => {
		const apiClient = {
			trips: jasmine.createSpy('trips').and.returnValue(dummyPromise())
		};
		const subject = mountRender({apiClient});
		expect(apiClient.trips).toHaveBeenCalledWith(null, null);
	});

	describe('When fetching trips succeeds', () => {
		it('renders the element returned by the render prop', async () => {
			const trips = {};
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

async function rejected(promise) {
	try {
		await promise;
		throw new Error('Expected a rejection but did not get one');
	} catch (e) {
	}
}

function mountRender(props) {
	const apiClient = props.apiClient || stubMybusesApiClient();
	const render = props.render || (() => <div />);

	return mount(
		<Provider store={configureStore(apiClient)}>
			<TripsContainer render={render} />
		</Provider>
	);
}
