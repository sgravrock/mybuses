import * as PropTypes from 'prop-types';

export interface Route {
	shortName: string;
}

export enum TimeType {
	Scheduled,
	Predicted
}

export interface AbsoluteTime {
	date: Date;
	type: TimeType;
}

export const absoluteTimeShape = PropTypes.shape({
	date: PropTypes.object.isRequired,
	type: PropTypes.oneOf([TimeType.Predicted, TimeType.Scheduled])
});

export interface SourceStop {
	name: string;
	metersFromEndpoint: number;

	// Just using arrival time assumes that buses arrive and depart at
	// the same time, which is true with the rare exception of layover
	// stops (e.g. 1_18085 on the 44).
	arrivalTime: AbsoluteTime;
}

export const sourceStopShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	metersFromEndpoint: PropTypes.number.isRequired,
	arrivalTime: absoluteTimeShape.isRequired,
});

export interface DestStop {
	name: string;
	metersFromEndpoint: number;
	arrivalTime: AbsoluteTime;
}

export const destStopShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	metersFromEndpoint: PropTypes.number.isRequired,
	arrivalTime: absoluteTimeShape.isRequired,
});


export interface Trip {
	tripId: string;
	route: Route;
	srcStop: SourceStop;
	destStop: DestStop;
}

export const tripShape = PropTypes.shape({
	tripId: PropTypes.string.isRequired,
	route: PropTypes.shape({shortName: PropTypes.string.isRequired}).isRequired,
	srcStop: sourceStopShape.isRequired,
	destStop: destStopShape.isRequired,
});