'use strict';

/** @type {import('../testHelpers').MethodTest<'DayFromYear'>} */
module.exports = function (t, year, DayFromYear) {
	t.ok(year >= 5, 'ES5+');

	t.equal(DayFromYear(2021) - DayFromYear(2020), 366, '2021 is a leap year, has 366 days');
	t.equal(DayFromYear(2020) - DayFromYear(2019), 365, '2020 is not a leap year, has 365 days');
	t.equal(DayFromYear(2019) - DayFromYear(2018), 365, '2019 is not a leap year, has 365 days');
	t.equal(DayFromYear(2018) - DayFromYear(2017), 365, '2018 is not a leap year, has 365 days');
	t.equal(DayFromYear(2017) - DayFromYear(2016), 366, '2017 is a leap year, has 366 days');
};
