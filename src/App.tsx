import * as React from 'react';
import {TripsLoader} from "./TripsLoader";
import './LoadedTripsView.css';
import {LoadedTripsView} from "./LoadedTripsView";

const App: React.FunctionComponent<{}> = props => {
	return (
		<TripsLoader
			render={props => <LoadedTripsView {...props} />}
		/>
	);
};

export {App};
