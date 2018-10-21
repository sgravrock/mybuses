import {DefaultRouter} from './default-router';
import {arbitraryPoint, arbitraryTrip, dummyPromise} from "./testSupport/stubs";
import {IRouter} from "./from-server/router";

describe('default-router', () => {
	describe('DefaultRouter', () => {
		describe('trips', () => {
			it('reqeusts the specified default trip', () => {
				const router = {
					findTrips: jasmine.createSpy('findTrips')
						.and.returnValue(dummyPromise())
				};
				const src = {lat: 1, lon: 2};
				const dest = {lat: 3, lon: 4};
				const subject = new DefaultRouter(router, src, dest);
				subject.trips();
				expect(router.findTrips).toHaveBeenCalledWith(src, dest);
			});
	
			describe('When the underlying router call succeeds', () => {
				it('resolves to the trips', async () => {
					const trips = [arbitraryTrip()];
					const router: IRouter = {
						findTrips: () => Promise.resolve(trips)
					};
					const subject = new DefaultRouter(router, arbitraryPoint(), arbitraryPoint());
					const result = await subject.trips();
					expect(result).toEqual(trips);
				});
			});
		});
	});
});