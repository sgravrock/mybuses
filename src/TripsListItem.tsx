import * as React from 'react';
import {TimeType, Trip, tripShape} from "./trips";
import {formatTime} from "./date";
import './TripsListItem.css';

interface Props {
    trip: Trip;
}

export class TripsListItem extends React.Component<Props, {}> {
    static propTypes = {
        trip: tripShape.isRequired,
    };

    render() {
        const trip = this.props.trip;

        return (
            <li className="TripsListItem" key={trip.tripId}>
                {trip.route.shortName} from {trip.srcStop.name}
                <div className="TripsListItem-time">
                    in {minutesUntil(trip.srcStop.arrivalTime.date)} minutes
                    ({formatTime(trip.srcStop.arrivalTime.date)})
                    {trip.srcStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
                </div>
                <div className="TripsListItem-time">
                    Arrive at {formatTime(trip.destStop.arrivalTime.date)}
                    {trip.destStop.arrivalTime.type === TimeType.Scheduled ? '*' : ''}
                </div>
            </li>

        )
    }
}


function minutesUntil(date: Date): number {
    const now = new Date().getTime();
    const millisUntil = date.getTime() - now;
    return Math.round((millisUntil / 1000.0 / 60.0) * 10) / 10;
}