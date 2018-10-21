import * as PropTypes from 'prop-types';

export interface Route {
	shortName: string;
}

export interface RelativeTime {
	minutesUntil: number;
	isScheduled: boolean;
}

export const relativeTimeShape = PropTypes.shape({
	minutesUntil: PropTypes.number.isRequired,
	isScheduled: PropTypes.bool.isRequired
});

export interface AbsoluteTime {
	date: string;
	isScheduled: boolean;
}

export const absoluteTimeShape = PropTypes.shape({
	date: PropTypes.string.isRequired,
	isScheduled: PropTypes.bool.isRequired
});

export interface SourceStop {
	name: string;
	metersFromEndpoint: number;
	arrivalTime: RelativeTime;
}

export const sourceStopShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	metersFromEndpoint: PropTypes.number.isRequired,
	arrivalTime: relativeTimeShape.isRequired,
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
	route: { shortName: string };
	srcStop: SourceStop;
	destStop: DestStop;
}

export const tripShape = PropTypes.shape({
	tripId: PropTypes.string.isRequired,
	route: PropTypes.shape({shortName: PropTypes.string.isRequired}).isRequired,
	srcStop: sourceStopShape.isRequired,
	destStop: destStopShape.isRequired,
});