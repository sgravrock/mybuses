import * as React from 'react';
// @ts-ignore
import {useState, useEffect, useContext} from 'react';
import * as PropTypes from 'prop-types';
import {Trip} from './trips';
import {IDefaultRouter, DefaultRouterContext} from "./routing/default-router";

interface Props {
	render: (trips: Trip[]) => JSX.Element;
}

const TripsContainer: React.SFC<Props> = (props) => {
	const [loadingFailed, setLoadingFailed] = useState(false);
	const [trips, setTrips] = useState(null);
	const router: IDefaultRouter = useContext(DefaultRouterContext);

	useEffect(() => {
		router.trips()
			.then(
				setTrips,
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