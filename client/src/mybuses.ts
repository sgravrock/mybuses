import {AxiosInstance} from "axios";

export class ApiClient {
	private _axios: AxiosInstance;

	constructor(axios: AxiosInstance) {
		this._axios = axios;
	}

	trips() {
		return this._axios.get('/trips').then(result => result.data.trips);
	}
}
