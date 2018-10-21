import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import {App} from './App';
import {DefaultRouter, DefaultRouterContext} from './routing/default-router';
import {Router} from "./routing/router";
import {ObaClient} from "./OBA/obaClient";
import {ObaRequest} from "./OBA/obaRequest";
import {JsonpAdapter} from "./OBA/JsonpAdapter";

const jsonp = new JsonpAdapter(document.body, window);
const obaClient = new ObaClient(new ObaRequest(jsonp, requireEnv('REACT_APP_OBA_API_KEY')));
const src = {
	lat: parseFloat(requireEnv('REACT_APP_SRC_LAT')),
	lon: parseFloat(requireEnv('REACT_APP_SRC_LON'))
};
const dest = {
	lat: parseFloat(requireEnv('REACT_APP_DEST_LAT')),
	lon: parseFloat(requireEnv('REACT_APP_DEST_LON'))
};
const router = new DefaultRouter(new Router(obaClient), src, dest);

ReactDOM.render(
	<DefaultRouterContext.Provider value={router}>
		<App />
	</DefaultRouterContext.Provider>,
	document.getElementById('root')
);

function requireEnv(key: string) {
	const value = process.env[key];

	if (value) {
		return value;
	}

	throw new Error(`Enviornment variable ${key} is not set`);
}