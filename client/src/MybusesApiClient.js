export class MybusesApiClient {
	constructor(axios) {
		this._axios = axios;
	}

	trips() {
		return this._axios.get('/trips').then(result => result.data);
	}
}
