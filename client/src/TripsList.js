import React from 'react';
import './TripList.css';

export function TripsList(props) {
	return (
		<ol className="TripsList">
			{props.trips.map(trip => (
				<li key={trip.tripId}>
					{trip.route.shortName} from {trip.srcStop.name}
					<div className="TripsList-time">
						in {trip.srcStop.arrivalTime.minutesUntil} minutes
					</div>
				</li>
			))}
		</ol>
	);
}
