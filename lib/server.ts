import * as express from "express";
import Mustache = require("mustache");
import * as fs from "fs";
import { Router } from "./router";
import { Point } from "./obaClient";

function require_env(env: any, name: string) {
	const value = env[name];

	if (!value) {
		throw new Error("The " + name + " environment variable must be set");
	}

	return value;
}

function pointFromQuery(query: any, prefix: string, fallback: Point): Point {
	const point = {
		lat: parseFloat(query[prefix + 'lat']),
		lon: parseFloat(query[prefix + 'lon']),
	};

	if (isNaN(point.lat) || isNaN(point.lon)) {
		point.lat = fallback.lat;
		point.lon = fallback.lon;
	}

	return point;
}

interface ServerDeps {
	env: any;
	app: express.Application;
	router: Router;
}

export class Server {
	_app: express.Application;
	_port: number;

	constructor(deps?: ServerDeps) {
		this._app = deps ? deps.app : express();
		const env = deps ? deps.env : process.env;

		const defaultSrc = {
			lat: parseFloat(require_env(env, "SRC_LAT")),
			lon: parseFloat(require_env(env, "SRC_LON")),
		};
		const defaultDest = {
			lat: parseFloat(require_env(env, "DEST_LAT")),
			lon: parseFloat(require_env(env, "DEST_LON")),
		};
		const key = require_env(env, "OBA_API_KEY");
		this._port = parseInt(env.PORT || "80", 10);
		const router = deps ? deps.router : new Router({key: key});

		this._app.get('/', function (req: any, res: any) {
			const src = pointFromQuery(req.query, "src", defaultSrc);
			const dest = pointFromQuery(req.query, "dest", defaultDest);

			router.findTrips(src, dest).then(function(trips) {
				fs.readFile("./lib/index.mst", "utf8", function(err, template) {
					if (err) {
						console.error(err);
						res.status(500).send(err);
					} else {
		    			var rendered = Mustache.render(template, {trips: trips});
						res.send(rendered);
					}
				});
			});
		});
	}

	start() { 
		this._app.listen(this._port, () => {
			console.log('Listening on port ' + this._port);
		});
	}
}
