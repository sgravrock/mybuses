import {AxiosPromise, AxiosRequestConfig} from "axios";
import {Trip} from "./trips";

export interface IEnoughAxios {
	get(url: string, config?: AxiosRequestConfig): AxiosPromise<any>;
}

export interface IApiClient {
	trips(): Promise<Trip[]>;
}

export class ApiClient implements IApiClient {
	private _axios: IEnoughAxios;

	constructor(axios: IEnoughAxios) {
		this._axios = axios;
	}

	trips(): Promise<Trip[]> {
		return this._axios.get('/trips').then(result => result.data.trips);
	}
}
