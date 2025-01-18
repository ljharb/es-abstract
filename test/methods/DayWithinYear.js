'use strict';

/** @type {import('../testHelpers').MethodTest<'DayWithinYear'>} */
module.exports = function (t, year, DayWithinYear) {
	t.ok(year >= 5, 'ES5+');

	t.equal(DayWithinYear(Date.UTC(2019, 0, 1)), 0, '1/1 is the 1st day');
	t.equal(DayWithinYear(Date.UTC(2019, 11, 31)), 364, '12/31 is the 365th day in a non leap year');
	t.equal(DayWithinYear(Date.UTC(2016, 11, 31)), 365, '12/31 is the 366th day in a leap year');
};
