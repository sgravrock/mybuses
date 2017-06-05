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

interface PageResult {
	template: string;
	object: any;
}

export class Server {
	_app: express.Application;
	_port: number;
	_env: any;
	_router: Router;

	constructor(deps?: ServerDeps) {
		this._app = deps ? deps.app : express();
		this._env = deps ? deps.env : process.env;
		const key = require_env(this._env, "OBA_API_KEY");
		this._port = parseInt(this._env.PORT || "80", 10);
		this._router = deps ? deps.router : new Router({key: key});

		this._app.get('/', (req: any, resp: any) => {
			this.tripsBetweenPoints(req.query)
				.then(result => this._render(resp, result));
		});

		this._app.get('/where', (req: any, resp: any) => {
			this._render(resp, this.where());
		});
	}

	start() { 
		this._app.listen(this._port, () => {
			console.log('Listening on port ' + this._port);
		});
	}

	tripsBetweenPoints(query: any): Promise<PageResult> {
		const defaultSrc = {
			lat: parseFloat(require_env(this._env, "SRC_LAT")),
			lon: parseFloat(require_env(this._env, "SRC_LON")),
		};
		const defaultDest = {
			lat: parseFloat(require_env(this._env, "DEST_LAT")),
			lon: parseFloat(require_env(this._env, "DEST_LON")),
		};
		const src = pointFromQuery(query, "src", defaultSrc);
		const dest = pointFromQuery(query, "dest", defaultDest);

		return this._router.findTrips(src, dest).then(function(trips) {
			trips.forEach(t => {
				(t.destStop as any).arrivalTimestamp = t.destStop.scheduledArrivalTime.getTime();
			});

			return {
				template: "./lib/index.mst",
				object: {
					src: src,
					dest: dest,
					trips: trips,
					trace: query.trace,
				}
			};
		});
	}

	where(): PageResult {
		return {
			template: "./lib/where.mst",
			object: null
		};
	}

	_render(response: any, result: PageResult) {
		fs.readFile(result.template, "utf8", function(err, template) {
			if (err) {
				console.error(err);
				response.status(500).send(err);
			} else {
				response.send(Mustache.render(template, result.object));
			}
		});
	}
}
