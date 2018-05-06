const http = require("http");
const { URL, URLSearchParams } = require("url");

function delay(millis: number) {
	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve();
		}, millis);
	});
}

export interface IObaRequest {
	get(path: string, params: any): Promise<any>;
}

export class ObaRequest implements IObaRequest {
	_http: any;
	_key: string;

	constructor(http: any, apiKey: string) {
		this._http = http;
		this._key = apiKey;
	}

	async get(path: string, params: any): Promise<any> {
		const body = await this._getOnce(path, params)

		if (body.code === 429) {
			// Rate limited
			await delay(500);
			return this.get(path, params);
		}

		return body;
	}

	_getOnce(path: string, params: any): any {
		return new Promise((resolve, reject) => {
			const url = this._buildUrl(path, params);
			this._http.get(url, function(response: any) {
				var body = '';

				response.on("data", (chunk: string) => body += chunk);
				response.on("end", () => resolve(JSON.parse(body)));
			}).on('error', (e: any) => {
				reject(e);
			});
		});
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
