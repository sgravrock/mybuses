import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {fetchDefaultTrips} from './trips/actions';

export function TripsContainer_(props) {
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
}

TripsContainer_.propTypes = {
	render: PropTypes.func.isRequired,
	fetchTrips: PropTypes.func.isRequired,
	loadingState: PropTypes.string.isRequired,
	trips: PropTypes.object
};

function mapStateToProps(state) {
	return {
		trips: state.trips.trips,
		loadingState: state.trips.loadingState
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchTrips: () => {
			dispatch(fetchDefaultTrips());
		}
	};
}

export const TripsContainer = connect(
	mapStateToProps, mapDispatchToProps
)(TripsContainer_);
