declare type Indexer<T> = (thing: T) => any;

export function uniqueBy<T>(input: T[], indexer: Indexer<T>): T[] {
	const indices: any[] = [];
	return input.filter(x => {
		const ix = indexer(x);
		const include = indices.indexOf(ix) === -1;
		indices.push(ix);
		return include;
	});
}

