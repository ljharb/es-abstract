'use strict';

/** @type {import('../testHelpers').MethodTest<'InLeapYear'>} */
module.exports = function (t, year, InLeapYear) {
	t.ok(year >= 5, 'ES5+');

	t.equal(InLeapYear(Date.UTC(2021, 0, 1)), 0, '2021 is not a leap year');
	t.equal(InLeapYear(Date.UTC(2020, 0, 1)), 1, '2020 is a leap year');
	t.equal(InLeapYear(Date.UTC(2019, 0, 1)), 0, '2019 is not a leap year');
	t.equal(InLeapYear(Date.UTC(2018, 0, 1)), 0, '2018 is not a leap year');
	t.equal(InLeapYear(Date.UTC(2017, 0, 1)), 0, '2017 is not a leap year');
	t.equal(InLeapYear(Date.UTC(2016, 0, 1)), 1, '2016 is a leap year');
};
