import * as React from 'react';
import {TripsLoader} from "./TripsLoader";
import './LoadedTripsView.css';
import {LoadedTripsView} from "./LoadedTripsView";
import {DisplayFilterProvider} from "./DisplayFilter";

const App: React.FunctionComponent<{}> = props => {
	return (
		<DisplayFilterProvider>
			<TripsLoader
				render={props => <LoadedTripsView {...props} />}
			/>
		</DisplayFilterProvider>
	);
};

export {App};
