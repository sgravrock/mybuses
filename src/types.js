// @flow
export type ArrivalAndDeparture = {
	tripId: string,
	stopSequence: number
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
