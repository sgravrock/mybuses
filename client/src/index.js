import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import {MybusesApiClient} from './MybusesApiClient';
import registerServiceWorker from './registerServiceWorker';
import axios from 'axios';

const apiClient = new MybusesApiClient(axios.create({
	baseURL: 'http://localhost:3000/'
}));

ReactDOM.render(
	<App mybusesApiClient={apiClient} />,
	document.getElementById('root')
);
registerServiceWorker();
