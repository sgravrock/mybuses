import { Server } from "./server";
import { ObaClient } from "./obaClient";
import { ObaRequest } from "./obaRequest";
import { Router } from "./router";
import * as express from "express";

const http = require("http");

function require_env(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error("The " + name + " environment variable must be set");
	}

	return value;
}

const obaRequest = new ObaRequest(http, require_env("OBA_API_KEY"));
const obaClient = new ObaClient(obaRequest);
const router = new Router(obaClient);
new Server(express(), router, process.env).start();
