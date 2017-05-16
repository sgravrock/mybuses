"use strict";
var http = require("http");
var httpVcr = require("../http-vcr");
var tmp = require("tmp");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

describe("http-vcr", function() {
	var verifyResponse = function(expectedBody, done) {
		return function(response) {
			var receivedBody = '';
			expect(response.statusCode).toEqual(200);
		
			response.on("data", function(chunk) {
				receivedBody += chunk;
			});
			
			response.on("end", function() {
				expect(receivedBody).toEqual(expectedBody);
				done();
			});
		}
	};

	var verifyWrite = function(filePath, expectedBody, done) {
		return function(response) {
			response.on("end", function() {
				fs.readFile(filePath, 'utf8', function(err, data) {
					if (err) {
						done.fail(err);
					} else {
						expect(data).toEqual(expectedBody);
						done();
					}
				});
			});
		};
	};

	beforeEach(function() {
		this.tempDir = tmp.dirSync({unsafeCleanup: true}).name;
	});

	describe("Recording", function() {
		var handleRequest = function() {};
		var server, subject, port;

		beforeEach(function(done) {
			server = http.createServer(function(request, response) {
				handleRequest(request, response);
			});

			subject = httpVcr.record(this.tempDir);
			port = 3123;

			server.listen(port, function(err) {
				if (err) {
					done.fail(err);
				} else {
					done();
				}
			});
		});

		afterEach(function(done) {
			server.close(done);
		});

		it("returns the recorded response", function(done) {
			var body = '{answer: 42}';
			handleRequest = function(request, response) {
				response.writeHead(200);
				response.end(body, "utf8");
			};

			subject.get({host: "localhost", port: port},
				verifyResponse(body, done));
		});

		it("saves the response body", function(done) {
			var body = '{answer: 42}';
			var requestPath = '/foo/bar?baz=qux';
			var filePath = path.join(this.tempDir, requestPath);
			handleRequest = function(request, response) {
				response.writeHead(200);
				response.end(body, "utf8");
			};

			subject.get({host: "localhost", port: port, path: requestPath},
				 verifyWrite(filePath, body, done));
		});

		it("removes the specified query parameter", function(done) {
			var body = "stripped";
			var requestPath = "/foo/bar?baz=qux&key=asdf&grault=fred";
			var filePath = path.join(this.tempDir, "/foo/bar?baz=qux&grault=fred");
			handleRequest = function(request, response) {
				response.writeHead(200);
				response.end(body, "utf8");
			};

			subject.stripParam("key");
			subject.get({host: "localhost", port: port, path: requestPath},
				 verifyWrite(filePath, body, done));
		});
	});

	describe("Playback", function() {
		var saveFile = function(filePath, body, callback) {

			mkdirp(path.dirname(filePath), function(err) {
				if (err) {
					callback(err);
				} else {
					fs.writeFile(filePath, body, callback);
				}
			});
		};

		it("plays back the contents of a file that exists", function(done) {
			var body = "some contents";
			var requestPath = '/foo/bar?baz=qux';
			var filePath = path.join(this.tempDir, requestPath);
			var subject = httpVcr.playback(this.tempDir);

			saveFile(filePath, body, function(err) {
				if (err) {
					done.fail(err);
				} else {
					var options = {
						host: "localhost",
						port: 80,
						path: requestPath
					};
					subject.get(options, verifyResponse(body, done));
				}
			});
		});

		it("accepts a URL as well as an options hash", function(done) {
			var body = "some contents";
			var requestPath = "foo/bar?baz=qux";
			var filePath = path.join(this.tempDir, requestPath);
			var subject = httpVcr.playback(this.tempDir);

			saveFile(filePath, body, function(err) {
				if (err) {
					done.fail(err);
				} else {
					var url = "http://localhost/" + requestPath;
					subject.get(url, verifyResponse(body, done));
				}
			});
		});

		it("removes specified path components", function(done) {
			var body = "stripped";
			var requestPath = "/foo/bar?baz=qux&key=asdf&grault=fred";
			var filePath = path.join(this.tempDir, "/foo/bar?baz=qux&grault=fred");
			var subject = httpVcr.playback(this.tempDir);
			subject.stripParam("key");

			saveFile(filePath, body, function(err) {
				if (err) {
					done.fail(err);
				} else {
					var options = {
						host: "localhost",
						port: 80,
						path: requestPath
					};
					subject.get(options, verifyResponse(body, done));
				}
			});
		});

		it("aborts when the file does not exist", function(done) {
			var subject = httpVcr.playback(this.tempDir);
			var options = {
				host: "localhost",
				port: 80,
				path: "/whatever"
			};
			spyOn(subject, "logError");
			subject.get(options, function(response) {
				response.on("aborted", function() {
					expect(subject.logError).toHaveBeenCalled();
					done();
				});
			});
		});
	});
});
