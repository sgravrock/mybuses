// const http = require("http");
// const path = require("path");
// const fs = require("fs");
// const mkdirp = require("mkdirp");
// const parseUrl = require("url").parse;
// const stripParam = require("../../lib/stripParam").stripParam;


import {stripParam} from "../from-server/stripParam";
import * as path from "path";
import * as URL from 'url';
import {AxiosResponse} from "axios";
import * as fs from 'fs';
import {makeAxiosResponse} from "./axios";

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
	private _dir: string;
	_paramToStrip?: string;

	constructor(dir: string) {
		this._dir = dir;
	}

	stripParam(k: string) {
		this._paramToStrip = k;
	}

	get(url: string): Promise<AxiosResponse<any>> {
		const path = pathAndQueryFromUrl(url);
		const filename = filePath(this._dir, path, this._paramToStrip);

		return new Promise(function(resolve, reject) {
			fs.readFile(filename, "utf8", function(err, contents) {
				if (err) {
					reject(new Error('No such file: ' + path));
				} else {
					resolve(makeAxiosResponse({
						status: 200,
						data: JSON.parse(contents),
					}));
				}
			});
		});
	}
}


// Player.prototype.stripParam = function(k) {
// 	this._paramToStrip = k;
// };

// Player.prototype.get = function(urlOrOptions, callback) {
// 	var path = pathAndQueryFromUrl(urlOrOptions);
// 	var filename = filePath(this._dir, path, this._paramToStrip);
// 	var response = new Response();
// 	var that = this;
//
// 	fs.readFile(filename, "utf8", function(err, contents) {
// 		if (err) {
// 			that.logError(err);
// 			setImmediate(function() {
// 				response._trigger("aborted");
// 			});
// 		} else {
// 			response.statusCode = 200;
// 			setImmediate(function() {
// 				response._trigger("data", contents);
// 				response._trigger("end");
// 			});
// 		}
//
// 		callback(response);
// 	});
//
// 	return response;
// };


export function playback(dir: string) {
	return new Player(dir);
}