import * as React from 'react';
import * as PropTypes from 'prop-types';
import {Trip} from './trips';
import {DefaultRouterContext} from "./routing/default-router";
import {useContext, useEffect, useMemo, useState} from "react";

export interface TripsLoaderChildProps {
	trips: Trip[];
	reload: () => void;
}

interface Props {
	render: (props: TripsLoaderChildProps) => JSX.Element;
}

const TripsLoader: React.FunctionComponent<Props> = props => {
	const [trips, setTrips] = useState<Trip[] | null>(null);
	const [loadingFailed, setLoadingFailed] = useState(false);
	const apiClient = useContext(DefaultRouterContext);
	const fetchTrips = useMemo(() => {
		return () => {
			apiClient.trips()
				.then(
					(trips: Trip[]) => setTrips(trips),
					() => setLoadingFailed(true)
				);
		};
	}, [apiClient]);

	function reload() {
		setTrips(null);
		fetchTrips();
	}

	useEffect(() => {
		fetchTrips()
	}, [fetchTrips]);

	if (trips) {
		return props.render({trips, reload});
	} else if (loadingFailed) {
		return <div>Unable to find trips.</div>;
	} else {
		return <div>Searching for trips...</div>;
	}
};

TripsLoader.propTypes = {
	render: PropTypes.func.isRequired,
};

export {TripsLoader};