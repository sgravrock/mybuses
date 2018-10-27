import * as React from 'react';
import {TripsContainer} from "./TripsContainer";
import {Trip} from "./trips";
import {TripsList} from "./TripsList";

export class App extends React.Component {
	render() {
		return (
			<div className="App">
				<TripsContainer
					render={(trips: Trip[]) => <TripsList trips={trips}/>}
				/>
			</div>
		);
	}
}
