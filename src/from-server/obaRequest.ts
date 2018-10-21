import {IEnoughAxios} from "../default-router";
import {AxiosResponse} from "axios";

export interface IObaRequest {
	get(path: string, params: any): Promise<any>;
}

export class ObaRequest implements IObaRequest {
	_axios: IEnoughAxios;
	_key: string;

	constructor(axios: IEnoughAxios, apiKey: string) {
		this._axios = axios;
		this._key = apiKey;
	}

	get(path: string, params: any): Promise<any> {
		const url = this._buildUrl(path, params);
		return this._axios.get(url)
			.then((response: AxiosResponse<any>) => response.data);
	}

	_buildUrl(path: string, params: any) {
		const url = new URL("http://api.pugetsound.onebusaway.org");
		url.pathname = path;
		url.searchParams.append("key", this._key);
		Object.keys(params).forEach(function (k) {
			url.searchParams.append(k, params[k]);
		});

		return url.toString();
	}
}
