beforeAll(() => {
	// Convert unhandled promise rejections to exceptions so that Jasmine
	// will pick them up. This isn't perfect -- they don't necessarily get
	// routed to the right test -- but it means we get a stack trace, which
	// is a lot better than the default Node behavior.
	//
	// This normally comes up when a component throws during re-render.
	// There appear to be promises involved, but they aren't part of any
	// chain available to the test, so the test can't handle the rejection
	process.on('unhandledRejection', error => {
		console.error('Unhandled promise rejection');
		throw error;
	});
});

export async function rejected<T>(promise: Promise<T>) {
	try {
		await promise;
		throw new Error('Expected a rejection but did not get one');
	} catch (e) {
		return e;
	}
}