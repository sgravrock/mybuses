import * as React from 'react';
import {TripsLoader} from "./TripsLoader";
import {TripsList} from "./TripsList";

const App: React.FunctionComponent<{}> = props => {
	return (
		<div className="App">
			<TripsLoader
				render={({trips, reload}) => (
					<>
						<button data-testid="reload" onClick={reload}>
							Reload
						</button>
						<TripsList trips={trips}/>
					</>
				)}
			/>
		</div>
	);
};

export {App};
