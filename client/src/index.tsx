import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import {ApiClient, MybusesApiContext} from './mybuses';

import axios from 'axios';

const axiosOptions: {baseURL?: string} = {};

if (window.location.href.indexOf('http://localhost:3001/') === 0) {
	axiosOptions.baseURL = 'http://localhost:3000/';
}

const apiClient = new ApiClient(axios.create(axiosOptions));

ReactDOM.render(
	<MybusesApiContext.Provider value={apiClient}>
		<App />
	</MybusesApiContext.Provider>,
	document.getElementById('root')
);
