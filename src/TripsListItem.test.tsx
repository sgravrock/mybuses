import * as React from 'react';
import {shallow} from 'enzyme';
import {
	arbitraryTrip,
	arbitrarySrcStop,
	arbitraryDestStop,
	arbitrarySrcArrivalTime,
	arbitraryDestArrivalTime,
} from './testSupport/stubs';
import {dateFromLocalTime} from './testSupport/date';
import {TimeType} from "./trips";
import {TripsListItem} from "./TripsListItem";

describe('TripsListItem', () => {
    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    it('shows an asterisk next to scheduled departure times', () => {
    	jasmine.clock().mockDate(dateFromLocalTime(12, 0, 0));
		const trip = tripWithSrcArrivalTime({
			date: dateFromLocalTime(12, 2, 48),
			type: TimeType.Scheduled
		});
		const subject = shallow(<TripsListItem trip={trip} />);
		const timeField = subject.find('.TripsListItem-time').at(0);
		expect(timeField.text()).toEqual('in 2.8 minutes (12:02)*');
	});

	it('does not show an asterisk next to predicted departure times', () => {
        jasmine.clock().mockDate(dateFromLocalTime(12, 0, 0));
        const trip = tripWithSrcArrivalTime({
            date: dateFromLocalTime(12, 2, 48),
			type: TimeType.Predicted
		});
        const subject = shallow(<TripsListItem trip={trip} />);
		const timeField = subject.find('.TripsListItem-time').at(0);
		expect(timeField.text()).toEqual('in 2.8 minutes (12:02)');
	});

	it('shows an asterisk next to scheduled arrival times', () => {
		const trip = tripWithDestArrivalTime({
			date: dateFromLocalTime(20, 38),
            type: TimeType.Scheduled
		});
        const subject = shallow(<TripsListItem trip={trip} />);
		const timeField = subject.find('.TripsListItem-time').at(1);
		expect(timeField.text()).toEqual('Arrive at 20:38*');
	});

	it('does not show an asterisk next to predicted arrival times', () => {
		const trip = tripWithDestArrivalTime({
			date: dateFromLocalTime(20, 38),
            type: TimeType.Predicted
		});
        const subject = shallow(<TripsListItem trip={trip} />);
		const timeField = subject.find('.TripsListItem-time').at(1);
		expect(timeField.text()).toEqual('Arrive at 20:38');
	});
});

function tripWithSrcArrivalTime(partialArrivalTime: any) {
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

function tripWithDestArrivalTime(partialArrivalTime: any) {
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
