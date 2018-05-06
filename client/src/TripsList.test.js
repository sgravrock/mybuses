import React from 'react';
import {shallow} from 'enzyme';
import {TripsList} from './TripsList';
import {
	arbitraryTrip,
	arbitrarySrcStop,
	arbitraryDestStop,
	arbitrarySrcArrivalTime,
	arbitraryDestArrivalTime,
} from './stubs';
import {dateFromLocalTime} from './testSupport/date';

describe('TripsList', () => {
	it('shows an asterisk next to scheduled departure times', () => {
		const trip = tripWithSrcArrivalTime({
			minutesUntil: 2.8,
			isScheduled: true
		});
		const subject = shallow(<TripsList trips={[trip]} />);
		const timeField = subject.find('.TripsList-time').at(0);
		expect(timeField.text()).toEqual('in 2.8 minutes*');
	});

	it('does not show an asterisk next to predicted departure times', () => {
		const trip = tripWithSrcArrivalTime({
			minutesUntil: 2.8,
			isScheduled: false
		});
		const subject = shallow(<TripsList trips={[trip]} />);
		const timeField = subject.find('.TripsList-time').at(0);
		expect(timeField.text()).toEqual('in 2.8 minutes');
	});

	it('shows an asterisk next to scheduled arrival times', () => {
		const trip = tripWithDestArrivalTime({
			date: dateFromLocalTime(20, 38),
			isScheduled: true
		});
		const subject = shallow(<TripsList trips={[trip]} />);
		const timeField = subject.find('.TripsList-time').at(1);
		expect(timeField.text()).toEqual('Arrive at 20:38*');
	});

	it('does not show an asterisk next to predicted arrival times', () => {
		const trip = tripWithDestArrivalTime({
			date: dateFromLocalTime(20, 38),
			isScheduled: false
		});
		const subject = shallow(<TripsList trips={[trip]} />);
		const timeField = subject.find('.TripsList-time').at(1);
		expect(timeField.text()).toEqual('Arrive at 20:38');
	});
});

function tripWithSrcArrivalTime(partialArrivalTime) {
	return {
		...arbitraryTrip(),
		srcStop: {
			...arbitrarySrcStop(),
			arrivalTime: {
				...arbitrarySrcArrivalTime(),
				...partialArrivalTime
			}
		}
	};
}

function tripWithDestArrivalTime(partialArrivalTime) {
	return {
		...arbitraryTrip(),
		destStop: {
			...arbitraryDestStop(),
			arrivalTime: {
				...arbitraryDestArrivalTime(),
				...partialArrivalTime
			}
		}
	};
}
