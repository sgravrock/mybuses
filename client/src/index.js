import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import './index.css';
import {App} from './App';
import {ApiClient} from './mybuses';
import {configureStore} from './store';
import axios from 'axios';

const apiClient = new ApiClient(axios.create({
	baseURL: 'http://localhost:3000/'
}));
const store = configureStore(apiClient);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
);
