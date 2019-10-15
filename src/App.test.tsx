import * as React from 'react';
import {mount} from 'enzyme'
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
import {findByLabelText, findByText} from "./testSupport/queries";
import {Trip} from "./trips";


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
		expect(tripsList).toHaveProp('trips', trips);
		expect(tripsList.text()).toMatch(
			/D Line from 15th Ave NW & NW Leary Way/
		);
		expect(tripsList.text()).toMatch(/in 1\.8 minutes/);
		expect(tripsList.text()).toMatch(/Arrive at 20:38/);
	});

	it('reloads trips when the user clicks reload', async () => {
		const tripsPromise = Promise.resolve([]);
		const mybusesApiClient = {
			trips: jasmine.createSpy('trips').and.returnValue(tripsPromise)
		};
		const subject = mountRender({mybusesApiClient});
		expect(mybusesApiClient.trips).toHaveBeenCalledWith();
		mybusesApiClient.trips.calls.reset();
		await tripsPromise;
		subject.update();

		findByText(subject, 'button', 'Reload').simulate('click');
		subject.update();

		expect(mybusesApiClient.trips).toHaveBeenCalledWith();
		expect(subject.find(TripsList)).not.toExist();
		expect(subject.text()).toContain('Searching for trips');
	});

	it('preserves filter settngs across reloads', async () => {
		const trips: Trip[] = [
			{
				...arbitraryTrip(),
				tripId: '1',
				route: {
					...arbitraryRoute(),
					shortName: '15'
				}
			},
			{
				...arbitraryTrip(),
				tripId: '2',
				route: {
					...arbitraryRoute(),
					shortName: 'Not the 15'
				}
			},
		];
		const tripsPromise = Promise.resolve(trips);
		const mybusesApiClient = {
			trips: () => tripsPromise
		};
		const subject = mountRender({mybusesApiClient});
		const checkbox = () => findByLabelText(subject, 'Show only the 15');
		const tripsList = () => subject.find(TripsList);

		await tripsPromise;
		subject.update();

		checkbox().simulate('change', {target: {checked: true}});

		findByText(subject, 'button', 'Reload').simulate('click');
		await tripsPromise;
		subject.update();
		expect(checkbox()).toHaveProp('checked', true);
		expect(tripsList()).toHaveProp('trips', [trips[0]]);
	});
});

function mountRender(props: any) {
	return mount(
		<DefaultRouterContext.Provider value={props.mybusesApiClient}>
			<App/>
		</DefaultRouterContext.Provider>
	);
}
