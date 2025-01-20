'use strict';

module.exports = function (t, year, SystemTimeZoneIdentifier) {
	t.ok(year >= 2024, 'ES2024+');

	t.test('Intl supported', { skip: typeof Intl === 'undefined' }, function (st) {
		st.equal(
			SystemTimeZoneIdentifier(),
			new Intl.DateTimeFormat().resolvedOptions().timeZone,
			'system time zone identifier is resolved from Intl.DateTimeFormat'
		);

		st.end();
	});

	t.test('Intl not supported', { skip: typeof Intl !== 'undefined' }, function (st) {
		st.equal(
			SystemTimeZoneIdentifier(),
			'UTC',
			'system time zone identifier is UTC'
		);

		st.end();
	});
};
