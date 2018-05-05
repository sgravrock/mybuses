export function formatTime(date) {
	date = new Date(date);
	return date.getHours() + ':' + zpad(date.getMinutes(), 2);
}

export function zpad(n, digits) {
	let s = n + '';

	while (s.length < digits) {
		s = '0' + s;
	}

	return s;
}

