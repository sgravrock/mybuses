import {ApiClient} from './mybuses';
import {AxiosResponse} from "axios";
import {arbitraryTrip} from "./testSupport/stubs";

describe('mybuses', () => {
	describe('ApiClient', () => {
		describe('trips', () => {
			it('makes a request to /trips', () => {
				const axios = {
					get: jasmine.createSpy('get').and.returnValue(
						new Promise(() => {})
					)
				};
				const subject = new ApiClient(axios);
				subject.trips();
				expect(axios.get).toHaveBeenCalledWith('/trips');
			});
	
			describe('When the response is a 200 with JSON', () => {
				it('resolves to the trips', async () => {
					const trips = [arbitraryTrip()];
					const response = {data: {trips}};
					const axios = {get: () => Promise.resolve(makeAxiosResponse(response))};
					const subject = new ApiClient(axios);
					const result = await subject.trips();
					expect(result).toEqual(trips);
				});
			});
		});
	});
});

function makeAxiosResponse<T>(partialResponse: {data: T}): AxiosResponse<T> {
	return {
		status: 200,
		statusText: '',
		headers: [],
		config: {},
		...partialResponse
	};
}