import * as React from 'react';
import {Provider} from 'react-redux'
import {mount} from 'enzyme';
import {DefaultTripPage} from './DefaultTripPage';
import {TripsList} from './TripsList';
import {configureStore} from './store';
import {
	arbitraryTrip,
	arbitraryRoute,
	arbitrarySrcStop,
	arbitrarySrcArrivalTime,
	arbitraryDestStop,
	arbitraryDestArrivalTime,
} from './testSupport/stubs';
import {dateFromLocalTime} from './testSupport/date';

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
					...arbitraryDestArrivalTime(),
					date: dateFromLocalTime(20, 38)
				}
			}
		}];

		const tripsPromise = Promise.resolve(trips);
		const mybusesApiClient = {
			trips: jasmine.createSpy('trips').and.returnValue(tripsPromise)
		};
		const subject = mountRender({mybusesApiClient});
		expect(mybusesApiClient.trips).toHaveBeenCalledWith();
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

function mountRender(props: any) {
	const store = configureStore(props.mybusesApiClient);
	return mount(
		<Provider store={store}>
			<DefaultTripPage />
		</Provider>
	);
}
