export function dateFromLocalTime(hours: number, minutes: number): Date {
	// Attempt to construct a date that will produce the correct time
	// in the current time zone.
	// Complications:
	// * Our tests can't just specify a time zone. JS is going to use local.
	// * Even if we assume one physical time zone, there's DST to deal with.
	// * Date objects apply DST logic based on the date represented by the
	//   date object, not the current date. So in the US Pacific time zone
	//   which is UTC-8 in the winter, this code will return 19:
	//   new Date('2018-01-01T20:38:14.000-07:00').getHours()
	// * It's not possible to reliably detrmine the DST offset in effect on
	//   a given day. JS runtimes differ in whether a date's
	//   getTimezoneOffset method returns the current offset or the offset in
	//   effect at that date.
	//
	// Because of all that, just hardcoding most of the ISO 8601 string and
	// appending a computed UTC offset won't work. But building a date object
	// that uses the current day will, as long as we only care about the time
	// portion. It might break when run very close to a DST transition though.

	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(),
		hours, minutes);
}
