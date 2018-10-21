import {stripParam} from "../from-server/stripParam";
import * as path from "path";
import * as URL from 'url';
import * as fs from 'fs';

function filePath(dir: string, requestPath: string, paramToStrip?: string) {
	let base = requestPath || '/';

	if (paramToStrip) {
		base = stripParam(base, paramToStrip);
	}

	return path.join(dir, base);
}

function pathAndQueryFromUrl(url: string): string {
	return URL.parse(url).path!;
}

class Player {
	_paramToStrip?: string;
	private _dir: string;

	constructor(dir: string) {
		this._dir = dir;
	}

	stripParam(k: string) {
		this._paramToStrip = k;
	}

	get(url: string): Promise<any> {
		const path = pathAndQueryFromUrl(url);
		const filename = filePath(this._dir, path, this._paramToStrip);

		return new Promise(function(resolve, reject) {
			fs.readFile(filename, "utf8", function(err, contents) {
				if (err) {
					reject(new Error('No such file: ' + path));
				} else {
					resolve(JSON.parse(contents));
				}
			});
		});
	}
}

export function playback(dir: string) {
	return new Player(dir);
}