import * as React from 'react';
import {TripsContainer} from './TripsContainer';
import {TripsList} from './TripsList';
import {Trip} from "./trips";

export function DefaultTripPage(props: {}) {
	return (
		<div className="DefaultTripPage">
			<TripsContainer
				render={(trips: Trip[]) => <TripsList trips={trips} /> }
			/>
		</div>
	);
}
