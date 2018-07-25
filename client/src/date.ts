export function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	return date.getHours() + ':' + zpad(date.getMinutes(), 2);
}

export function zpad(n: number, digits: number): string {
	let s = n + '';

	while (s.length < digits) {
		s = '0' + s;
	}

	return s;
}

