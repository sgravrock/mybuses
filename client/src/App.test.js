import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import {App} from './App';
import {DefaultTripPage} from './DefaultTripPage';
import {stubMybusesApiClient} from './stubs';
import {MybusesContext} from './mybuses';


describe('App', () => {
	it('shows the default trip', () => {
		const subject = mount(
			<MybusesContext.Provider value={stubMybusesApiClient()}>
				<App />
			</MybusesContext.Provider>
		);
		expect(subject.find(DefaultTripPage)).toExist();
	});
});
