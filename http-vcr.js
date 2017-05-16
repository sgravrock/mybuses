const http = require("http");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const parseUrl = require("url").parse;
const stripParam = require("./stripParam");


function filePath(dir, requestPath, paramToStrip) {
	var base = requestPath || '/';

	if (paramToStrip) {
		base = stripParam(base, paramToStrip);
	}

	return path.join(dir, base);
}

function pathAndQueryFromUrl(urlOrOptions) {
	if (urlOrOptions.path) {
		return urlOrOptions.path;
	} else {
		return parseUrl(urlOrOptions).path;
	}
}

function Response() {
	this._handlers = {};
};

Response.prototype.on = function(event, handler) {
	this._handlers[event] = handler;
};

Response.prototype._trigger = function(event, arg) {
	var f = this._handlers[event];

	if (f) {
		f(arg);
	}
};

function Recorder(dir) {
	this._dir = dir;
};

Recorder.prototype.stripParam = function(k) {
	this._paramToStrip = k;
};

Recorder.prototype.get = function(options, callback) {
	var that = this;
	var outerResponse = new Response();

	http.get(options, function(response) {
		var body = '';

		response.on("data", function(chunk) {
			body += chunk;
			outerResponse._trigger("data", chunk);
		});

		response.on("end", function() {
			var filename = filePath(that._dir, options.path, that._paramToStrip);
			// TODO: How should we report errors saving the file?
			mkdirp(path.dirname(filename), function() {
				fs.writeFile(filename, body, "utf8", function() {
					outerResponse._trigger("end");
				});
			});
		});

		outerResponse.statusCode = response.statusCode;
		callback(outerResponse);
	});
};

function record(dir) {
	return new Recorder(dir);
}

function Player(dir) {
	this._dir = dir;
}

Player.prototype.stripParam = function(k) {
	this._paramToStrip = k;
};

Player.prototype.get = function(urlOrOptions, callback) {
	var path = pathAndQueryFromUrl(urlOrOptions);
	var filename = filePath(this._dir, path, this._paramToStrip);
	var that = this;

	fs.readFile(filename, "utf8", function(err, contents) {
		var response = new Response();

		if (err) {
			that.logError(err);
			setTimeout(function() {
				response._trigger("aborted");
			});
		} else {
			response.statusCode = 200;
			setTimeout(function() {
				response._trigger("data", contents);
				response._trigger("end");
			});
		}

		callback(response);
	});
};

Player.prototype.logError = function(error) {
	console.error(error);
};

function playback(dir) {
	return new Player(dir);
}

module.exports = {
	record: record,
	playback: playback
};
