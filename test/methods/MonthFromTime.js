'use strict';

/** @type {import('../testHelpers').MethodTest<'MonthFromTime'>} */
module.exports = function (t, year, MonthFromTime) {
	t.ok(year >= 5, 'ES5+');

	t.equal(MonthFromTime(Date.UTC(2019, 0, 1)), 0, 'non-leap: 1/1 gives January');
	t.equal(MonthFromTime(Date.UTC(2019, 0, 31)), 0, 'non-leap: 1/31 gives January');
	t.equal(MonthFromTime(Date.UTC(2019, 1, 1)), 1, 'non-leap: 2/1 gives February');
	t.equal(MonthFromTime(Date.UTC(2019, 1, 28)), 1, 'non-leap: 2/28 gives February');
	t.equal(MonthFromTime(Date.UTC(2019, 1, 29)), 2, 'non-leap: 2/29 gives March');
	t.equal(MonthFromTime(Date.UTC(2019, 2, 1)), 2, 'non-leap: 3/1 gives March');
	t.equal(MonthFromTime(Date.UTC(2019, 2, 31)), 2, 'non-leap: 3/31 gives March');
	t.equal(MonthFromTime(Date.UTC(2019, 3, 1)), 3, 'non-leap: 4/1 gives April');
	t.equal(MonthFromTime(Date.UTC(2019, 3, 30)), 3, 'non-leap: 4/30 gives April');
	t.equal(MonthFromTime(Date.UTC(2019, 4, 1)), 4, 'non-leap: 5/1 gives May');
	t.equal(MonthFromTime(Date.UTC(2019, 4, 31)), 4, 'non-leap: 5/31 gives May');
	t.equal(MonthFromTime(Date.UTC(2019, 5, 1)), 5, 'non-leap: 6/1 gives June');
	t.equal(MonthFromTime(Date.UTC(2019, 5, 30)), 5, 'non-leap: 6/30 gives June');
	t.equal(MonthFromTime(Date.UTC(2019, 6, 1)), 6, 'non-leap: 7/1 gives July');
	t.equal(MonthFromTime(Date.UTC(2019, 6, 31)), 6, 'non-leap: 7/31 gives July');
	t.equal(MonthFromTime(Date.UTC(2019, 7, 1)), 7, 'non-leap: 8/1 gives August');
	t.equal(MonthFromTime(Date.UTC(2019, 7, 30)), 7, 'non-leap: 8/30 gives August');
	t.equal(MonthFromTime(Date.UTC(2019, 8, 1)), 8, 'non-leap: 9/1 gives September');
	t.equal(MonthFromTime(Date.UTC(2019, 8, 30)), 8, 'non-leap: 9/30 gives September');
	t.equal(MonthFromTime(Date.UTC(2019, 9, 1)), 9, 'non-leap: 10/1 gives October');
	t.equal(MonthFromTime(Date.UTC(2019, 9, 31)), 9, 'non-leap: 10/31 gives October');
	t.equal(MonthFromTime(Date.UTC(2019, 10, 1)), 10, 'non-leap: 11/1 gives November');
	t.equal(MonthFromTime(Date.UTC(2019, 10, 30)), 10, 'non-leap: 11/30 gives November');
	t.equal(MonthFromTime(Date.UTC(2019, 11, 1)), 11, 'non-leap: 12/1 gives December');
	t.equal(MonthFromTime(Date.UTC(2019, 11, 31)), 11, 'non-leap: 12/31 gives December');

	t.equal(MonthFromTime(Date.UTC(2016, 0, 1)), 0, 'leap: 1/1 gives January');
	t.equal(MonthFromTime(Date.UTC(2016, 0, 31)), 0, 'leap: 1/31 gives January');
	t.equal(MonthFromTime(Date.UTC(2016, 1, 1)), 1, 'leap: 2/1 gives February');
	t.equal(MonthFromTime(Date.UTC(2016, 1, 28)), 1, 'leap: 2/28 gives February');
	t.equal(MonthFromTime(Date.UTC(2016, 1, 29)), 1, 'leap: 2/29 gives February');
	t.equal(MonthFromTime(Date.UTC(2016, 2, 1)), 2, 'leap: 3/1 gives March');
	t.equal(MonthFromTime(Date.UTC(2016, 2, 31)), 2, 'leap: 3/31 gives March');
	t.equal(MonthFromTime(Date.UTC(2016, 3, 1)), 3, 'leap: 4/1 gives April');
	t.equal(MonthFromTime(Date.UTC(2016, 3, 30)), 3, 'leap: 4/30 gives April');
	t.equal(MonthFromTime(Date.UTC(2016, 4, 1)), 4, 'leap: 5/1 gives May');
	t.equal(MonthFromTime(Date.UTC(2016, 4, 31)), 4, 'leap: 5/31 gives May');
	t.equal(MonthFromTime(Date.UTC(2016, 5, 1)), 5, 'leap: 6/1 gives June');
	t.equal(MonthFromTime(Date.UTC(2016, 5, 30)), 5, 'leap: 6/30 gives June');
	t.equal(MonthFromTime(Date.UTC(2016, 6, 1)), 6, 'leap: 7/1 gives July');
	t.equal(MonthFromTime(Date.UTC(2016, 6, 31)), 6, 'leap: 7/31 gives July');
	t.equal(MonthFromTime(Date.UTC(2016, 7, 1)), 7, 'leap: 8/1 gives August');
	t.equal(MonthFromTime(Date.UTC(2016, 7, 30)), 7, 'leap: 8/30 gives August');
	t.equal(MonthFromTime(Date.UTC(2016, 8, 1)), 8, 'leap: 9/1 gives September');
	t.equal(MonthFromTime(Date.UTC(2016, 8, 30)), 8, 'leap: 9/30 gives September');
	t.equal(MonthFromTime(Date.UTC(2016, 9, 1)), 9, 'leap: 10/1 gives October');
	t.equal(MonthFromTime(Date.UTC(2016, 9, 31)), 9, 'leap: 10/31 gives October');
	t.equal(MonthFromTime(Date.UTC(2016, 10, 1)), 10, 'leap: 11/1 gives November');
	t.equal(MonthFromTime(Date.UTC(2016, 10, 30)), 10, 'leap: 11/30 gives November');
	t.equal(MonthFromTime(Date.UTC(2016, 11, 1)), 11, 'leap: 12/1 gives December');
	t.equal(MonthFromTime(Date.UTC(2016, 11, 31)), 11, 'leap: 12/31 gives December');
};
