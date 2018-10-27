/*
TODO: do we need <reference types="jasmine-enzyme" />?
or maybe <reference types="../../node_modules/@types/jasmine-enzyme" />
or maybe <reference path="../typings/jasmine-enzyme/index.d.ts" />
 */
import * as React from 'react';
import {mount} from 'enzyme';
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
import {TripsList} from "./TripsList";


describe('App', () => {
	beforeEach(() => {
		jasmine.clock().install();
	});

	afterEach(() => {
		jasmine.clock().uninstall();
	});

	it('shows trips for the default route', async () => {
		jasmine.clock().mockDate(dateFromLocalTime(20, 30));

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
	return mount(
		<DefaultRouterContext.Provider value={props.mybusesApiClient}>
			<App/>
		</DefaultRouterContext.Provider>
	);
}
