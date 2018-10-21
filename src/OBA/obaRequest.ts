export interface IObaRequest {
	get(path: string, params: any): Promise<any>;
}

export interface IHttpGetter {
	get(url: string): Promise<any>
}

export class ObaRequest implements IObaRequest {
	_http: IHttpGetter;
	_key: string;

	constructor(http: IHttpGetter, apiKey: string) {
		this._http = http;
		this._key = apiKey;
	}

	get(path: string, params: any): Promise<any> {
		const url = this._buildUrl(path, params);
		return this._http.get(url);
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
