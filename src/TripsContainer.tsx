import * as React from 'react';
import * as PropTypes from 'prop-types';
import {Trip} from './trips';
import {IDefaultRouter, DefaultRouterContext} from "./routing/default-router";

interface OuterProps {
	render: (trips: Trip[]) => JSX.Element;
}

interface Props extends OuterProps {
	apiClient: IDefaultRouter;
}

interface State {
	loadingFailed: boolean;
	trips?: Trip[]
}

class InnerTripsContainer extends React.Component<Props, State> {
	static propTypes = {
		render: PropTypes.func.isRequired,
		apiClient: PropTypes.object.isRequired
	};

	constructor(props: Props) {
		super(props);
		this.state = {loadingFailed: false};
	}

	componentDidMount() {
		this.props.apiClient.trips()
			.then(
				(trips: Trip[]) => this.setState({trips}),
				() => this.setState({loadingFailed: true})
			)
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

export const TripsContainer: React.SFC<OuterProps> = (props) => {
	return (
		<DefaultRouterContext.Consumer>
			{apiClient => <InnerTripsContainer {...props} apiClient={apiClient}/>}
		</DefaultRouterContext.Consumer>
	)
};