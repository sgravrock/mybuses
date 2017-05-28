const express = require('express');
const app = express();
import Mustache = require("mustache");
import * as fs from "fs";
import { Router } from "./router";

function require_env(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error("The " + name + " environment variable must be set");
	}

	return value;
}

const src = {
	lat: parseFloat(require_env("SRC_LAT")),
	lon: parseFloat(require_env("SRC_LON")),
};
const dest = {
	lat: parseFloat(require_env("DEST_LAT")),
	lon: parseFloat(require_env("DEST_LON")),
};
const key = require_env("OBA_API_KEY");

app.get('/', function (req: any, res: any) {
	new Router({key: key}).findTrips(src, dest).then(function(trips) {
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

const port = parseInt(process.env.PORT || "80", 10);

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});
