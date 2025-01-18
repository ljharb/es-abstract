'use strict';

/** @type {import('../testHelpers').MethodTest<'DefaultTimeZone'>} */
module.exports = function (t, year, DefaultTimeZone) {
	t.equal(year, 2023, 'ES2023 only');

	t.test('Intl supported', { skip: typeof Intl === 'undefined' }, function (st) {
		st.equal(
			DefaultTimeZone(),
			new Intl.DateTimeFormat().resolvedOptions().timeZone,
			'default time zone is resolved from Intl.DateTimeFormat'
		);

		st.end();
	});

	t.test('Intl not supported', { skip: typeof Intl !== 'undefined' }, function (st) {
		st.equal(
			DefaultTimeZone(),
			'UTC',
			'default time zone is UTC'
		);

		st.end();
	});
};
