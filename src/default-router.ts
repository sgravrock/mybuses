import {Trip} from "./trips";
import * as React from "react";
import {Point} from "./from-server/obaClient";
import {IRouter} from "./from-server/router";

export interface IDefaultRouter {
	trips(): Promise<Trip[]>;
}

export class DefaultRouter implements IDefaultRouter {
	private _router: IRouter;
	private _src: Point;
	private _dest: Point;

	constructor(router: IRouter, src: Point, dest: Point) {
		this._router = router;
		this._src = src;
		this._dest = dest;
	}

	trips(): Promise<Trip[]> {
		return this._router.findTrips(this._src, this._dest);
	}
}

export const DefaultRouterContext = React.createContext<IDefaultRouter>({
	trips: () => {
		throw new Error('DefaultRouterContext.Provider was instantiated without a value');
	}
});