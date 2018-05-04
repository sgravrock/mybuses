import React from 'react';

export const MybusesContext = React.createContext('mybuses');

export class ApiClient {
	constructor(axios) {
		this._axios = axios;
	}

	trips() {
		return this._axios.get('/trips').then(result => result.data);
	}
}
