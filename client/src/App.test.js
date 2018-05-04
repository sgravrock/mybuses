import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import {App} from './App';
import {DefaultTripPage} from './DefaultTripPage';
import {stubMybusesApiClient} from './stubs';


describe('App', () => {
	it('shows the default trip', () => {
		const subject = mount(<App mybusesApiClient={stubMybusesApiClient()} />);
		expect(subject.find(DefaultTripPage)).toExist();
	});
});
