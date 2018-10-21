import {AxiosResponse} from "axios";

function appendParam(url: string, param: string) {
	if (url.indexOf("?") === -1) {
		return url + "?" + param;
	} else {
		return url + "&" + param;
	}
}

export class JsonpAdapter {
	private _dom: HTMLElement;
	private _global: any;
	private _nextShimId: number;

	constructor(dom: HTMLElement, globalObject: any) {
		this._dom = dom;
		this._global = globalObject;
		this._nextShimId = 0;
	}

	get(url: string): Promise<AxiosResponse<any>> {
		const shimId = this._nextShimId++;
		const shimName = "_jsonpShim" + shimId;

		return new Promise((resolve, reject) => {
			this._global[shimName] = (payload: any) => {
				delete this._global[shimName];
				resolve({
					status: 200,
					statusText: 'OK',
					headers: [],
					config: {},
					data: payload
				});
			};

			const script = document.createElement("script");
			script.src = appendParam(url, "callback=" + shimName);
			script.onerror = () => {
				delete this._global[shimName];
				reject(new Error("Failed to load " + url));
			};

			this._dom.appendChild(script);
		});
	}
};
