import * as React from 'react';
import {TimeType, Trip, tripShape} from "./trips";
import {formatTime} from "./date";
import './TripsListItem.css';
import {useCurrentTime} from "./useCurrentTime";

interface Props {
	trip: Trip;
}

const TripsListItem: React.SFC<Props> = (props) => {
	const now = useCurrentTime(1000 * 10);
	const trip = props.trip;

	return (
		<li className="TripsListItem" key={trip.tripId}>
			{trip.route.shortName} from {trip.srcStop.name}
			<div className="TripsListItem-time">
				in {minutesBetween(now, trip.srcStop.arrivalTime.date)} minutes
				({formatTime(trip.srcStop.arrivalTime.date)})
				{trip.srcStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
			</div>
			<div className="TripsListItem-time">
				Arrive at {formatTime(trip.destStop.arrivalTime.date)}
				{trip.destStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
			</div>
		</li>

	)
};

TripsListItem.propTypes = {
	trip: tripShape.isRequired,
};

export {TripsListItem};

function minutesBetween(date1: Date, date2: Date): number {
	const millisBetween = date2.getTime() - date1.getTime();
	return Math.round((millisBetween / 1000.0 / 60.0) * 10) / 10;
}