import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import './index.css';
import {App} from './App';
import {ApiClient} from './mybuses';
import {configureStore} from './store';
import axios from 'axios';

const axiosOptions: any = {};

if (window.location.href.indexOf('http://localhost:3001/') === 0) {
	axiosOptions.baseURL = 'http://localhost:3000/';
}

const apiClient = new ApiClient(axios.create(axiosOptions));
const store = configureStore(apiClient);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
);
