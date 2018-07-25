import * as React from 'react';
import {connect} from 'react-redux';
import * as PropTypes from 'prop-types';
import {fetchDefaultTrips} from './trips/actions';
import {tripShape} from './trips';

const InnerTripsContainer: React.SFC<any> = (props) => {
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

InnerTripsContainer.propTypes = {
	render: PropTypes.func.isRequired,
	fetchTrips: PropTypes.func.isRequired,
	loadingState: PropTypes.string.isRequired,
	trips: PropTypes.arrayOf(tripShape)
};

function mapStateToProps(state: any) {
	return {
		trips: state.trips.trips,
		loadingState: state.trips.loadingState
	};
}

function mapDispatchToProps(dispatch: any) {
	return {
		fetchTrips: () => {
			dispatch(fetchDefaultTrips());
		}
	};
}

export const TripsContainer = connect(
	mapStateToProps, mapDispatchToProps
)(InnerTripsContainer);
