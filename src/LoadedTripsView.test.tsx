import * as React from 'react';
import {Trip} from "./trips";
import {arbitraryRoute, arbitraryTrip} from "./testSupport/stubs";
import {findByLabelText} from "./testSupport/queries";
import {TripsList} from "./TripsList";
import {mount} from "enzyme";
import {LoadedTripsView} from "./LoadedTripsView";
import {DisplayFilterProvider} from "./DisplayFilter";

describe('LoadedTripsView', () => {
	it('filters and unfliters routes', () => {
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
		const subject = mountRender({trips});
		const checkbox = () => findByLabelText(subject, 'Show only the 15');
		const list = () => subject.find(TripsList);

		checkbox().simulate('change', {target: {checked: true}});
		expect(list()).toHaveProp('trips', [trips[0]]);

		checkbox().simulate('change', {target: {checked: false}});
		expect(list()).toHaveProp('trips', trips);
	});
});

interface OptionalProps {
	trips?: Trip[];
	reload?: () => void;
}

function mountRender(props: OptionalProps) {
	return mount(
		<DisplayFilterProvider>
			<LoadedTripsView
				trips={props.trips || []}
				reload={props.reload || (() => {})}
			/>
		</DisplayFilterProvider>
	);
}