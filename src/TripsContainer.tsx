import * as React from 'react';
import * as PropTypes from 'prop-types';
import {Trip} from './trips';
import {DefaultRouterContext} from "./routing/default-router";
import {useContext, useEffect, useState} from "react";

interface Props {
	render: (trips: Trip[]) => JSX.Element;
}

const TripsContainer: React.FunctionComponent<Props> = props => {
	const [trips, setTrips] = useState<Trip[] | null>(null);
	const [loadingFailed, setLoadingFailed] = useState(false);
	const apiClient = useContext(DefaultRouterContext);

	useEffect(() => {
		apiClient.trips()
			.then(
				(trips: Trip[]) => setTrips(trips),
				() => setLoadingFailed(true)
			);
	}, []);

	if (trips) {
		return props.render(trips);
	} else if (loadingFailed) {
		return <div>Unable to find trips.</div>;
	} else {
		return <div>Searching for trips...</div>;
	}
};

TripsContainer.propTypes = {
	render: PropTypes.func.isRequired,
};

export {TripsContainer};