import React from 'react';
import PropTypes from 'prop-types';
import {mount} from 'enzyme';
import {DefaultTripPage} from './DefaultTripPage';
import {TripsList} from './TripsList';
import {MybusesContext} from './mybuses';
import {arbitraryTrip} from './stubs';

describe('DefaultTripPage', () => {
	it('shows trips for the default route', async () => {
		const trips = [arbitraryTrip()];
		const tripsPromise = Promise.resolve(trips);
		const mybusesApiClient = {
			trips: jasmine.createSpy('trips').and.returnValue(tripsPromise)
		};
		const subject = mountRender({mybusesApiClient});
		expect(mybusesApiClient.trips).toHaveBeenCalledWith(null, null);
		await tripsPromise;

		subject.update();
		const tripsList = subject.find(TripsList);
		expect(tripsList).toExist();
		expect(tripsList.prop('trips')).toEqual(trips);
	});
});

function mountRender(props) {
	return mount(
		<MybusesContext.Provider value={props.mybusesApiClient}>
			<DefaultTripPage />
		</MybusesContext.Provider>
	);
}
