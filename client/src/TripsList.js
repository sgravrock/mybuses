import React from 'react';
import {formatTime} from './date';
import './TripsList.css';

export function TripsList(props) {
	return (
		<ol className="TripsList">
			{props.trips.map(trip => (
				<li key={trip.tripId}>
					{trip.route.shortName} from {trip.srcStop.name}
					<div className="TripsList-time">
						in {trip.srcStop.arrivalTime.minutesUntil} minutes
					</div>
					<div className="TripsList-time">
						Arrive at {formatTime(trip.destStop.arrivalTime.date)}
					</div>
				</li>
			))}
		</ol>
	);
}
