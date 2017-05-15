var http = require("http");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");

function filePath(dir, requestPath, stripRe) {
	var base = requestPath || '/';

	if (stripRe) {
		base = base.replace(stripRe, '');
	}

	return path.join(dir, base);
};

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

Recorder.prototype.strip = function(re) {
	this._stripRe = re;
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
			var filename = filePath(that._dir, options.path, that._stripRe);
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

Player.prototype.strip = function(re) {
	this._stripRe = re;
};

Player.prototype.get = function(options, callback) {
	var filename = filePath(this._dir, options.path, this._stripRe);

	fs.readFile(filename, "utf8", function(err, contents) {
		var response = new Response();

		if (err) {
			console.error(err)
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

function playback(dir) {
	return new Player(dir);
}

module.exports = {
	record: record,
	playback: playback
};
