/*
TODO: do we need <reference types="jasmine-enzyme" />?
or maybe <reference types="../../node_modules/@types/jasmine-enzyme" />
or maybe <reference path="../typings/jasmine-enzyme/index.d.ts" />
 */
import * as React from 'react';
import {mount} from 'enzyme';
import {App} from './App';
import {DefaultTripPage} from './DefaultTripPage';
import {stubMybusesApiClient} from './testSupport/stubs';
import {MybusesApiContext} from './mybuses';


describe('App', () => {
	it('shows the default trip', () => {
		const subject = mount(
			<MybusesApiContext.Provider value={stubMybusesApiClient()}>
				<App />
			</MybusesApiContext.Provider>
		);
        expect(subject.find(DefaultTripPage)).toExist();
	});
});
