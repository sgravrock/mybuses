import * as React from 'react';
import {TripsLoader} from "./TripsLoader";
import {TripsList} from "./TripsList";
import './App.css';

const App: React.FunctionComponent<{}> = props => {
	return (
		<div className="App">
			<TripsLoader
				render={({trips, reload}) => (
					<>
						<header>
							<button data-testid="reload" onClick={reload}>
								Reload
							</button>
						</header>
						<main>
							<TripsList trips={trips}/>
						</main>
					</>
				)}
			/>
		</div>
	);
};

export {App};
