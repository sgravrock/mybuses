import {TripsLoaderChildProps} from "./TripsLoader";
import {TripsList} from "./TripsList";
import * as React from "react";
import './LoadedTripsView.css';
import {useDisplayFilter} from "./DisplayFilter";

export const LoadedTripsView: React.FC<TripsLoaderChildProps> = props => {
	const {showOnly15, setShowOnly15} = useDisplayFilter();

	function filterTrips() {
		if (showOnly15) {
			return props.trips.filter(t => t.route.shortName === '15');
		} else {
			return props.trips;
		}
	}

	return (
		<div className="LoadedTripsView">
			<header>
				<button onClick={props.reload}>
					Reload
				</button>
				<label>
					<input
						type="checkbox"
						checked={showOnly15}
						onChange={e => setShowOnly15(e.target.checked)}
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