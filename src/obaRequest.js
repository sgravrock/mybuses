const http = require("http");
const { URL, URLSearchParams } = require("url");

function delay(millis) {
	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve();
		}, millis);
	});
}

class ObaRequest {
	constructor(deps) {
		this._http = deps.http || http;

		if (!deps.key) {
			throw new Error("ObaRequest requires a key");
		}

		this._key = deps.key;
	}

	async get(path, params) {
		const body = await this._getOnce(path, params)

		if (body.code === 429) {
			// Rate limited
			await delay(500);
			return this.get(path, params);
		}

		return body;
	}

	_getOnce(path, params) {
		return new Promise((resolve, reject) => {
			const url = this._buildUrl(path, params);
			this._http.get(url, function(response) {
				var body = '';

				response.on("data", (chunk) => body += chunk);
				response.on("end", () => resolve(JSON.parse(body)));
			});
		});
	}

	_buildUrl(path, params) {
		const url = new URL("http://api.pugetsound.onebusaway.org");
		url.pathname = path;
		url.searchParams.append("key", this._key);
		Object.keys(params).forEach(function (k) {
			url.searchParams.append(k, params[k]);
		});

		return url.toString();
	}
}

module.exports = ObaRequest;
