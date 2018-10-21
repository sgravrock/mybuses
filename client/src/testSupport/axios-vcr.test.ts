"use strict";
import * as axiosVcr from './axios-vcr';
import * as fs from "fs";
import * as tmp from 'tmp';
import * as path from "path";
import * as mkdirp from 'mkdirp';
import {rejected} from "./promise";

interface Context {
	tempDir: string;
}

describe("axios-vcr", function() {
	beforeEach(function(this: Context) {
		this.tempDir = tmp.dirSync({unsafeCleanup: true}).name;
	});

	describe("Playback", function() {
		function mkdirPromise(path: string): Promise<void> {
			return new Promise(function(resolve, reject) {
				mkdirp(path, function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		}

		function writeFilePromise(path: string, body: string): Promise<void> {
			return new Promise(function(resolve, reject) {
				fs.writeFile(path, body, function(err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});

		}

		function saveFile(filePath: string, body: string): Promise<void> {
			return mkdirPromise(path.dirname(filePath)).then(() => writeFilePromise(filePath, body));
		}

		it("plays back the contents of a file that exists", async function(this: Context) {
			const body = '{"some": "json"}';
			const requestPath = '/foo/bar?baz=qux';
			const filePath = path.join(this.tempDir, requestPath);

			await saveFile(filePath, body);

			const subject = axiosVcr.playback(this.tempDir);
			const result = await subject.get('http://localhost' + requestPath);

			expect(result.status).toEqual(200);
			expect(result.data).toEqual({some: 'json'});
		});

		it("removes specified path components", async function(this: Context) {
			const body = '{"some": "json"}';
			const requestPath = "/foo/bar?baz=qux&key=asdf&grault=fred";
			const filePath = path.join(this.tempDir, "/foo/bar?baz=qux&grault=fred");
			const subject = axiosVcr.playback(this.tempDir);
			subject.stripParam("key");

			await saveFile(filePath, body);
			const result = await subject.get('http://localhost' + requestPath);

			expect(result.status).toEqual(200);
			expect(result.data).toEqual({some: 'json'});
		});

		it("rejects when the file does not exist", async function(this: Context) {
			const subject = axiosVcr.playback(this.tempDir);
			await rejected(subject.get('http://locahost/whatever'));
		});
	});
});
