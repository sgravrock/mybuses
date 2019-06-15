import * as React from 'react';
import {TripsLoader} from "./TripsLoader";
import {Trip} from "./trips";
import {TripsList} from "./TripsList";

const App: React.FunctionComponent<{}> = props => {
	return (
		<div className="App">
			<TripsLoader
				render={(trips: Trip[]) => <TripsList trips={trips}/>}
			/>
		</div>
	);
};

export {App};
