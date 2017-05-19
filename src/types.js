export type TripStub = {
	tripId: string
};

export type TripDetails = {
	tripId: string,
	route: {
		id: string,
		shortName: string
	}
};

export type Point = {
	lat: number,
	lon: number
};
