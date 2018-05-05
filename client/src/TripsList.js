import React from 'react';
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

function formatTime(date) {
	date = new Date(date);
	return date.getHours() + ':' + pad(date.getMinutes());
}

function pad(s) {
	if (s.length < 2) {
		return '0' + s;
	}

	return s;
}
