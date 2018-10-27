import * as React from 'react';
import {TimeType, Trip, tripShape} from "./trips";
import {formatTime} from "./date";
import './TripsListItem.css';
import Timeout = NodeJS.Timeout;

interface Props {
	trip: Trip;
}

interface State {
	currentTime: Date;
}

export class TripsListItem extends React.Component<Props, State> {
	static propTypes = {
		trip: tripShape.isRequired,
	};

	intervalId?: Timeout; // An unavoidable lie.

	constructor(props: Props) {
		super(props);
		this.state = {currentTime: new Date()};
	}

	componentDidMount() {
		this.intervalId = setInterval(() => {
			this.setState({currentTime: new Date()})
		}, 1000 * 10);
	}

	componentWillUnmount() {
		clearInterval(this.intervalId!);
	}

	render() {
		const trip = this.props.trip;

		return (
			<li className="TripsListItem" key={trip.tripId}>
				{trip.route.shortName} from {trip.srcStop.name}
				<div className="TripsListItem-time">
					in {minutesBetween(this.state.currentTime, trip.srcStop.arrivalTime.date)} minutes
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


function minutesBetween(date1: Date, date2: Date): number {
	const millisBetween = date2.getTime() - date1.getTime();
	return Math.round((millisBetween / 1000.0 / 60.0) * 10) / 10;
}