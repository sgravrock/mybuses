import * as React from 'react';
import {render} from 'react-testing-library'
import {App} from './App';
import {
	arbitraryDestArrivalTime,
	arbitraryDestStop,
	arbitraryRoute,
	arbitrarySrcArrivalTime,
	arbitrarySrcStop,
	arbitraryTrip
} from './testSupport/stubs';
import {DefaultRouterContext} from './routing/default-router';
import {dateFromLocalTime} from "./testSupport/date";
import * as tripsListModule from "./TripsList";


describe('App', () => {
	beforeEach(() => {
		jasmine.clock().install();
	});

	afterEach(() => {
		jasmine.clock().uninstall();
	});

	it('shows trips for the default route', async () => {
		jasmine.clock().mockDate(dateFromLocalTime(20, 30));
		spyOn(tripsListModule, 'TripsList').and.callThrough();

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
					date: dateFromLocalTime(20, 31, 48)
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
		const {container} = mountRender({mybusesApiClient});
		expect(mybusesApiClient.trips).toHaveBeenCalledWith();
		await tripsPromise;

		// TODO: maybe don't do this?
		expect((tripsListModule.TripsList as jasmine.Spy).calls.first().args[0].trips).toEqual(trips);

		const tripsList = container.querySelector('.TripsList');
		expect(tripsList).toBeTruthy();
		expect(tripsList!!.textContent).toMatch(
			/D Line from 15th Ave NW & NW Leary Way/
		);
		expect(tripsList!!.textContent).toMatch(/in 1\.8 minutes/);
		expect(tripsList!!.textContent).toMatch(/Arrive at 20:38/);
	});
});

function mountRender(props: any) {
	return render(
		<DefaultRouterContext.Provider value={props.mybusesApiClient}>
			<App/>
		</DefaultRouterContext.Provider>
	);
}
