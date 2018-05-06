import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux'
import {mount} from 'enzyme';
import {App} from './App';
import {DefaultTripPage} from './DefaultTripPage';
import {configureStore} from './store';
import {stubMybusesApiClient} from './testSupport/stubs';


describe('App', () => {
	it('shows the default trip', () => {
		const store = configureStore(stubMybusesApiClient());
		const subject = mount(
			<Provider store={store}>
				<App />
			</Provider>
		);
		expect(subject.find(DefaultTripPage)).toExist();
	});
});
