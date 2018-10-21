import * as React from 'react';
import * as PropTypes from 'prop-types';
import {formatTime} from './date';
import {Trip, tripShape} from './trips';
import './TripsList.css';
import {TimeType} from "./trips";

interface Props {
	trips: Trip[];
}

const TripsList: React.SFC<Props> = (props: Props) => {
	return (
		<div className="TripsList">
			<ol>
				{props.trips.map((trip: Trip) => (
					<li className="TripsList-item" key={trip.tripId}>
						{trip.route.shortName} from {trip.srcStop.name}
						<div className="TripsList-time">
							in {trip.srcStop.arrivalTime.minutesUntil} minutes
							{trip.srcStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
						</div>
						<div className="TripsList-time">
							Arrive at {formatTime(trip.destStop.arrivalTime.date)}
							{trip.destStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
						</div>
					</li>
				))}
			</ol>
			<p>
				* Denotes a scheduled time for which no vehicle status is
				available.
			</p>
			<p>
				The fine print: Mybuses won't find options that arrive more
				than two hours after departure or that involve more than one
				route. Results are (at best) only as accurate as the data
				provided by One Bus Away. If this software makes you late for
				work, we'll feel a little bad about it but accept no
				responsibility. This software was produced in a facility that
				also processes wheat, dairy, and peanuts. Offer void where
				prohibited by law. For external use only. Discontinue use and
				consult a doctor if you develop a rash or fever. Do not fold,
				spindle, or mutilate. Do not taunt Happy Fun Website.
			</p>
		
		</div>
	);
};

TripsList.propTypes = {
	trips: PropTypes.arrayOf(tripShape).isRequired
};

export {TripsList};