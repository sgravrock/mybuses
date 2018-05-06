import {ApiClient} from './mybuses';

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
					const trips = [{a: 42}];
					const response = {data: {trips}};
					const axios = {get: () => Promise.resolve(response)};
					const subject = new ApiClient(axios);
					const result = await subject.trips();
					expect(result).toEqual(trips);
				});
			});
		});
	});
});
