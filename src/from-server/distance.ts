interface Point {
	lat: number,
	lon: number
};

// http://www.johndcook.com/python_longitude_latitude.html
export function distanceOnUnitSphere(p1: Point, p2: Point): number {
	// Convert latitude and longitude to spherical coordinates in radians.
	const degreesToRadians = Math.PI / 180.0;

	// phi = 90 - latitude
	const phi1 = (90.0 - p1.lat) * degreesToRadians;
	const phi2 = (90.0 - p2.lat) * degreesToRadians;
		
	// theta = longitude
	const theta1 = p1.lon * degreesToRadians;
	const theta2 = p2.lon * degreesToRadians;
		
	// Compute spherical distance from spherical coordinates.
	// For two locations in spherical coordinates 
	// (1, theta, phi) and (1, theta, phi)
	// cosine( arc length ) = 
	//	sin phi sin phi' cos(theta-theta') + cos phi cos phi'
	// distance = rho * arc length
	
	const cos = Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) + 
		   Math.cos(phi1) * Math.cos(phi2);
	// Remember to multiply arc by the radius of the earth to get length.
	return Math.acos(cos);
}

//console.log(meanEarthRadiusInMiles * distanceOnUnitSphere(47.62, -122.351, 47.598, -122.33));
const meanEarthRadiusInMeters = 6371000;

export function distanceInMeters(p1: Point, p2: Point): number {
	return distanceOnUnitSphere(p1, p2) * meanEarthRadiusInMeters;
}
