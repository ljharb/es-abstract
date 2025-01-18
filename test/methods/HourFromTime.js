'use strict';

/** @type {import('../testHelpers').MethodTest<'HourFromTime'>} */
module.exports = function (t, year, HourFromTime) {
	t.ok(year >= 5, 'ES5+');

	var now = new Date();
	t.equal(HourFromTime(now.getTime()), now.getUTCHours(), 'hour from Date timestamp matches getUTCHours');
};
