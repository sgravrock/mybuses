import React from 'react';
import {formatTime} from './date';
import './TripsList.css';

export function TripsList(props) {
	return (
		<ol className="TripsList">
			{props.trips.map(trip => (
				<li className="TripsList-item" key={trip.tripId}>
					{trip.route.shortName} from {trip.srcStop.name}
					<div className="TripsList-time">
						in {trip.srcStop.arrivalTime.minutesUntil} minutes
						{trip.srcStop.arrivalTime.isScheduled ? '*' : ''}
					</div>
					<div className="TripsList-time">
						Arrive at {formatTime(trip.destStop.arrivalTime.date)}
						{trip.destStop.arrivalTime.isScheduled ? '*' : ''}
					</div>
				</li>
			))}
		</ol>
	);
}
