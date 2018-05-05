import React from 'react';
import PropTypes from 'prop-types';
import {mount} from 'enzyme';
import {DefaultTripPage} from './DefaultTripPage';
import {TripsList} from './TripsList';
import {MybusesContext} from './mybuses';
import {
	arbitraryTrip,
	arbitraryRoute,
	arbitrarySrcStop,
	arbitrarySrcArrivalTime,
	arbitraryDestStop,
	arbitraryDestArrivalTime,
} from './stubs';
import {zpad} from './date';

describe('DefaultTripPage', () => {
	it('shows trips for the default route', async () => {
		const trips = [{
			...arbitraryTrip(),
			route: {
				...arbitraryRoute(),
				shortName: 'D Line'
			},
			srcStop: {
				...arbitrarySrcStop(),
				name: '15th Ave NW & NW Leary Way',
				arrivalTime: {
					...arbitrarySrcArrivalTime(),
					minutesUntil: 1.8
				}
			},
			destStop: {
				...arbitraryDestStop(),
				arrivalTime: {
					...arbitraryDestArrivalTime,
					date: makeDate(20, 38)
				}
			}
		}];

		const tripsPromise = Promise.resolve({trips});
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
		expect(tripsList.text()).toMatch(
			/D Line from 15th Ave NW & NW Leary Way/
		);
		expect(tripsList.text()).toMatch(/in 1\.8 minutes/);
		expect(tripsList.text()).toMatch(/Arrive at 20:38/);
	});
});

function mountRender(props) {
	return mount(
		<MybusesContext.Provider value={props.mybusesApiClient}>
			<DefaultTripPage />
		</MybusesContext.Provider>
	);
}

function makeDate(hours, minutes) {
	// Attempt to construct an ISO 8601 date that will produce the correct time
	// in the current time zone.
	// Complications:
	// * Our tests can't just specify a time zone. JS is going to use local.
	// * Even if we assume one physical time zone, there's DST to deal with.
	// * Date objects apply DST logic based on the date represented by the
	//   date object, not the current date. So in the US Pacific time zone
	//   which is UTC-8 in the winter, this code will return 19:
	//   new Date('2018-01-01T20:38:14.000-07:00').getHours()
	// * It's not possible to reliably detrmine the DST offset in effect on
	//   a given day. JS runtimes differ in whether a date's
	//   getTimezoneOffset method returns the current offset or the offset in
	//   effect at that date.
	//
	// Because of all that, just hardcoding most of the ISO 8601 string and
	// appending a computed UTC offset won't work. But building a date object
	// that uses the current day will, as long as we only care about the time
	// portion. It might break when run very close to a DST transition though.

	const now = new Date();
	const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
		hours, minutes);
	return date.toISOString();
}
