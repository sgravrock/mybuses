import * as React from 'react';
import {TripsContainer} from "./TripsContainer";
import {Trip} from "./trips";
import {TripsList} from "./TripsList";

const App: React.FunctionComponent<{}> = props => {
	return (
		<div className="App">
			<TripsContainer
				render={(trips: Trip[]) => <TripsList trips={trips}/>}
			/>
		</div>
	);
};

export {App};
