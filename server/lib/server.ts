import * as express from "express";
import * as fs from "fs";
import { Router, TimeType } from "./router";
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

interface PageResult {
	template: string;
	object: any;
}

export class Server {
	logErrors: boolean;
	_app: express.Application;
	_port: number;
	_env: any;
	_router: Router;

	constructor(app: express.Application, router: Router, env: any) {
		this.logErrors = true;
		this._app = app;
		this._env = env;
		this._port = parseInt(this._env.PORT || "80", 10);
		this._router = router;

		this._app.use(express.static('static'));

		this._app.get('/trips', (req: any, resp: any) => {
			resp.set('Access-Control-Allow-Origin', '*');
			this.tripsBetweenPoints(req.query)
				.then(
					result => this._renderJson(resp, result),
					error => {
						if (this.logErrors) {
							console.error("tripsBetweenPoints failed", error);
						}

						resp.status(500);
						resp.send();
					}
				);
		});
	}

	start() { 
		this._app.use("/static", express.static("../client/public"));
		this._app.listen(this._port, () => {
			console.log('Listening on port ' + this._port);
		});
	}

	// TODO: refine the return type
	tripsBetweenPoints(query: any): Promise<any> {
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
				let srcArrTime = t.srcStop.arrivalTime;
				let destArrTime = t.destStop.arrivalTime;
				(srcArrTime as any).isScheduled = srcArrTime.type === TimeType.Scheduled;
				(destArrTime as any).isScheduled = destArrTime.type === TimeType.Scheduled;
				(destArrTime as any).timestamp = destArrTime.date.getTime();
			});

			return {
				src: src,
				dest: dest,
				trips: trips,
				trace: query.trace,
			};
		});
	}

	_renderJson(response: any, result: any) {
		response.send(JSON.stringify(result));
	}
}
