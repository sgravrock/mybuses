import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import {ApiClient, MybusesContext} from './mybuses';
import registerServiceWorker from './registerServiceWorker';
import axios from 'axios';

const apiClient = new ApiClient(axios.create({
	baseURL: 'http://localhost:3000/'
}));

ReactDOM.render(
	<MybusesContext.Provider value={apiClient}>
		<App />
	</MybusesContext.Provider>,
	document.getElementById('root')
);
registerServiceWorker();
