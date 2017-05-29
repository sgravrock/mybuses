export function sortBy<T>(a: T[], selector: (item: T) => any): void {
	a.sort((x, y) => {
		const xk = selector(x);
		const yk = selector(y);

		if (xk < yk) {
			return -1;
		} else if (xk > yk) {
			return 1;
		} else {
			return 0;
		}
	});
}
