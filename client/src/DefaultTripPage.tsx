import * as React from 'react';
import {TripsContainer} from './TripsContainer';
import {TripsList} from './TripsList';

export function DefaultTripPage(props: any) {
	return (
		<div className="DefaultTripPage">
			<TripsContainer
				render={(trips: any) => <TripsList trips={trips} /> }
			/>
		</div>
	);
}
