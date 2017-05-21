const express = require('express');
const app = express();
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
		res.send(JSON.stringify(trips));
	});
});

const port = parseInt(process.env.PORT || "80", 10);

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});
