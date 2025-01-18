'use strict';

/** @type {import('../testHelpers').MethodTest<'TimeFromYear'>} */
module.exports = function (t, year, TimeFromYear) {
	t.ok(year >= 5, 'ES5+');

	for (var i = 1900; i < 2100; i += 1) {
		t.equal(TimeFromYear(i), Date.UTC(i, 0, 1), 'TimeFromYear matches a Date object’s year: ' + i);
	}
};
