import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import {DefaultTripPage} from './DefaultTripPage';


export class App extends Component {
	static childContextTypes = {
		mybusesApiClient: PropTypes.object.isRequired,
	};

	getChildContext() {
		return {mybusesApiClient: this.props.mybusesApiClient};
	}

	render() {
		return (
			<div className="App">
				<DefaultTripPage />
			</div>
		);
	}
}
