import React from 'react';
import {TripsContainer} from './TripsContainer';
import {TripsList} from './TripsList';

export function DefaultTripPage(props) {
	return (
		<div className="DefaultTripPage">
			<TripsContainer
				render={tripsResult => <TripsList trips={tripsResult.trips} /> }
			/>
		</div>
	);
}
