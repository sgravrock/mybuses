/*
TODO: do we need <reference types="jasmine-enzyme" />?
or maybe <reference types="../../node_modules/@types/jasmine-enzyme" />
or maybe <reference path="../typings/jasmine-enzyme/index.d.ts" />
 */
import * as React from 'react';
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
