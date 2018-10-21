import {AxiosPromise, AxiosRequestConfig} from "axios";
import {Trip} from "./trips";
import * as React from "react";

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

export const MybusesApiContext = React.createContext<IApiClient>({
	trips: () => {
		throw new Error('MybusesApiContext.Provider was instantiated without a value');
	}
});