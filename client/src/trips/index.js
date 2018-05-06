import PropTypes from 'prop-types';

export const relativeTimeShape = PropTypes.shape({
	minutesUntil: PropTypes.number.isRequired,
	isScheduled: PropTypes.bool.isRequired
});

export const absoluteTimeShape = PropTypes.shape({
	date: PropTypes.string.isRequired,
	isScheduled: PropTypes.bool.isRequired
});

export const sourceStopShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	metersFromEndpoint: PropTypes.number.isRequired,
	arrivalTime: relativeTimeShape.isRequired,
});

export const destStopShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	metersFromEndpoint: PropTypes.number.isRequired,
	arrivalTime: absoluteTimeShape.isRequired,
});

export const tripShape = PropTypes.shape({
	route: PropTypes.shape({shortName: PropTypes.string.isRequired}),
	srcStop: sourceStopShape.isRequired,
	destStop: destStopShape.isRequired,
});
