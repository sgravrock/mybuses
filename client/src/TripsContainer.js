import React from 'react';
import PropTypes from 'prop-types';
import {MybusesContext} from './mybuses';

export class TripsContainer_ extends React.Component {
	static propTypes = {
		apiClient: PropTypes.object.isRequired,
		render: PropTypes.func.isRequired
	};

	state = {};

	componentWillMount() {
		this.props.apiClient.trips(null, null)
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

export function TripsContainer(props) {
	return (
		<MybusesContext.Consumer>
			{apiClient => (
				<TripsContainer_
					apiClient={apiClient}
					{...props}
				/>
			)}
		</MybusesContext.Consumer>
	);
}
