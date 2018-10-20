import * as React from 'react';
import {connect} from 'react-redux';
import * as PropTypes from 'prop-types';
import {fetchDefaultTrips} from './trips/actions';
import {Trip, tripShape} from './trips';
import {TripsLoadingState} from "./trips/reducers";
import {AppState} from "./store";

interface Props {
	render: (trips: Trip[]) => JSX.Element;
	fetchTrips: () => void;
	loadingState: TripsLoadingState;
	trips?: Trip[]
}

const InnerTripsContainer: React.SFC<Props> = (props: Props) => {
	if (props.loadingState === 'not started') {
		props.fetchTrips();
	}

	if (props.trips) {
		return props.render(props.trips);
	} else if (props.loadingState === 'failed') {
		return <div>Unable to find trips.</div>;
	} else {
		return <div>Searching for trips...</div>;
	}
};

InnerTripsContainer.propTypes = {
	render: PropTypes.func.isRequired,
	fetchTrips: PropTypes.func.isRequired,
	loadingState: PropTypes.string.isRequired,
	trips: PropTypes.arrayOf(tripShape)
};

function mapStateToProps(state: AppState) {
	return {
		trips: state.trips.trips,
		loadingState: state.trips.loadingState
	};
}

function mapDispatchToProps(dispatch: (a: any) => void) {
	return {
		fetchTrips: () => {
			dispatch(fetchDefaultTrips());
		}
	};
}

export const TripsContainer = connect(
	mapStateToProps, mapDispatchToProps
)(InnerTripsContainer);
