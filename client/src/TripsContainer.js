import React from 'react';
import PropTypes from 'prop-types';

export class TripsContainer extends React.Component {
	static contextTypes = {
		mybusesApiClient: PropTypes.object.isRequired
	};

	static propTypes = {
		render: PropTypes.func.isRequired
	};

	state = {};

	componentWillMount() {
		this.context.mybusesApiClient.trips(null, null)
			.then(
				trips => this.setState({trips}),
				error => this.setState({loadingFailed: true})
			);
	}

	render() {
		if (this.state.trips) {
			return this.props.render(this.state.trips);
		} else if (this.state.loadingFailed) {
			return <div>Unable to find trips.</div>;
		} else {
			return <div>Searching for trips...</div>;
		}
	}
}
