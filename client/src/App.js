import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import {DefaultTripPage} from './DefaultTripPage';


export class App extends Component {
	render() {
		return (
			<div className="App">
				<DefaultTripPage />
			</div>
		);
	}
}
