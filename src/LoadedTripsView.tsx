import {TripsLoaderChildProps} from "./TripsLoader";
import {TripsList} from "./TripsList";
import * as React from "react";
import './LoadedTripsView.css';
import {useState} from "react";

export const LoadedTripsView: React.FC<TripsLoaderChildProps> = props => {
	const [only15, setOnly15] = useState(false);

	function filterTrips() {
		if (only15) {
			return props.trips.filter(t => t.route.shortName === '15');
		} else {
			return props.trips;
		}
	}

	return (
		<div className="LoadedTripsView">
			<header>
				<button data-testid="reload" onClick={props.reload}>
					Reload
				</button>
				<label>
					<input
						type="checkbox"
						checked={only15}
						onChange={e => setOnly15(e.target.checked)}
					/>
					Show only the 15
				</label>
			</header>
			<main>
				<TripsList trips={filterTrips()}/>
			</main>
		</div>
	);
};