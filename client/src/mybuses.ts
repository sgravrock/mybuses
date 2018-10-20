import {AxiosPromise, AxiosRequestConfig} from "axios";

export interface IEnoughAxios {
	get(url: string, config?: AxiosRequestConfig): AxiosPromise<any>;
}

export class ApiClient {
	private _axios: IEnoughAxios;

	constructor(axios: IEnoughAxios) {
		this._axios = axios;
	}

	trips() {
		return this._axios.get('/trips').then(result => result.data.trips);
	}
}
