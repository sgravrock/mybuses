import * as React from 'react';
import {TimeType, Trip, tripShape} from "./trips";
import {formatTime} from "./date";
import './TripsListItem.css';
import {useEffect, useState} from "react";

interface Props {
	trip: Trip;
}

const TripsListItem: React.FunctionComponent<Props> = props =>  {
	const trip = props.trip;
	// TODO: a useTime hook would be nice
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const intervalId = setInterval(
			() => setCurrentTime(new Date())
			, 1000 * 10
		);
		return () => clearInterval(intervalId);
	}, []);

	return (
		<li className="TripsListItem" key={trip.tripId}>
			{trip.route.shortName} from {trip.srcStop.name}
			<div className="TripsListItem-time">
				in {minutesBetween(currentTime, trip.srcStop.arrivalTime.date)} minutes
				({formatTime(trip.srcStop.arrivalTime.date)})
				{trip.srcStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
			</div>
			<div className="TripsListItem-time">
				Arrive at {formatTime(trip.destStop.arrivalTime.date)}
				{trip.destStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
			</div>
		</li>

	);
};

TripsListItem.propTypes = {
	trip: tripShape.isRequired,
};

function minutesBetween(date1: Date, date2: Date): number {
	const millisBetween = date2.getTime() - date1.getTime();
	return Math.round((millisBetween / 1000.0 / 60.0) * 10) / 10;
}

export {TripsListItem};