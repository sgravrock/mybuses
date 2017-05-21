const URL = require("url").URL;

function stripParam(pathAndQuery: string, paramToStrip: string): string {
	const url = new URL("file://" + pathAndQuery);
	url.searchParams.delete(paramToStrip);
	return url.toString().replace(/^file:\/\//, '');
}

module.exports = stripParam;
