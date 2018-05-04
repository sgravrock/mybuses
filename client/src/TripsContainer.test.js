import React from 'react';
import PropTypes from 'prop-types';
import {shallow} from 'enzyme';
import {TripsContainer} from './TripsContainer';
import {dummyPromise, stubMybusesApiClient, arbitraryTrip} from './stubs';


describe('TripsContainer', () => {
	it('shows a loading indicator', () => {
		const subject = shallowRender({});
		expect(subject.text()).toEqual('Searching for trips...');
	});

	it('fetches trips', () => {
		const mybusesApiClient = {
			trips: jasmine.createSpy('trips').and.returnValue(dummyPromise())
		};
		const subject = shallowRender({mybusesApiClient});
		expect(mybusesApiClient.trips).toHaveBeenCalledWith(null, null);
	});

	describe('When fetching trips succeeds', () => {
		it('renders the element returned by the render prop', async () => {
			const trips = [arbitraryTrip()];
			const promise = Promise.resolve(trips);
			const mybusesApiClient = {
				trips: () => promise
			};
			const render = jasmine.createSpy('render').and.returnValue(
				<div className="foo" />
			);
			const subject = shallowRender({mybusesApiClient, render});
			await promise;
			subject.update();

			expect(render).toHaveBeenCalledWith(trips);
			expect(subject.find('.foo')).toExist();
		});
	});

	describe('When fetching trips fails', () => {
		it('shows an error message', async () => {
			const promise = Promise.reject('nope');
			const mybusesApiClient = {
				trips: () => promise
			};
			const subject = shallowRender({mybusesApiClient});
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

function shallowRender(props) {
	return shallow(
		<TripsContainer {...makeProps(props)} />,
		{ context: makeContext(props) }
	);
}

function makeProps(props) {
	return {
		render: props.render || (() => <div />)
	};
}

function makeContext(props) {
	return {
		mybusesApiClient: props.mybusesApiClient || stubMybusesApiClient()
	};
}
