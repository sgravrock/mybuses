import * as React from 'react';
// @ts-ignore
import {useState, useEffect} from 'react';
import * as PropTypes from 'prop-types';
import {Trip} from './trips';
import {IDefaultRouter, DefaultRouterContext, DefaultRouter} from "./routing/default-router";

interface OuterProps {
	render: (trips: Trip[]) => JSX.Element;
}

interface Props extends OuterProps {
	apiClient: IDefaultRouter;
}

const InnerTripsContainer: React.SFC<Props> = (props) => {
	const [loadingFailed, setLoadingFailed] = useState(false);
	const [trips, setTrips] = useState(null);

	useEffect(() => {
		props.apiClient.trips()
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

InnerTripsContainer.propTypes = {
	render: PropTypes.func.isRequired,
	// TODO this is wrong, but at least it compiles.
	apiClient: PropTypes.instanceOf(DefaultRouter).isRequired
};

export const TripsContainer: React.SFC<OuterProps> = (props) => {
	return (
		<DefaultRouterContext.Consumer>
			{apiClient => <InnerTripsContainer {...props} apiClient={apiClient}/>}
		</DefaultRouterContext.Consumer>
	)
};