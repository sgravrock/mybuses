import {MybusesApiClient} from './MybusesApiClient';

describe('MybusesApiClient', () => {
	describe('trips', () => {
		it('makes a request to /trips', () => {
			const axios = {
				get: jasmine.createSpy('get').and.returnValue(
					new Promise(() => {})
				)
			};
			const subject = new MybusesApiClient(axios);
			subject.trips();
			expect(axios.get).toHaveBeenCalledWith('/trips');
		});

		describe('When the response is a 200 with JSON', () => {
			it('resolves to the deserialized JSON', async () => {
				const payload = {a: 42};
				const response = {data: payload};
				const axios = {get: () => Promise.resolve(response)};
				const subject = new MybusesApiClient(axios);
				const result = await subject.trips();
				expect(result).toEqual(payload);
			});
		});
	});
});
