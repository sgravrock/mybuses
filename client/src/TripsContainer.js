import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {fetchDefaultTrips} from './trips/actions';

export class TripsContainer_ extends React.Component {
	static propTypes = {
		render: PropTypes.func.isRequired,
		fetchTrips: PropTypes.func.isRequired,
		loadingFailed: PropTypes.bool.isRequired,
		trips: PropTypes.object
	};

	componentWillMount() {
		this.props.fetchTrips();
	}

	render() {
		if (this.props.trips) {
			return this.props.render(this.props.trips);
		} else if (this.props.loadingFailed) {
			return <div>Unable to find trips.</div>;
		} else {
			return <div>Searching for trips...</div>;
		}
	}
}

function mapStateToProps(state) {
	return {
		trips: state.trips.trips,
		loadingFailed: state.trips.loadingState === 'failed'
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
