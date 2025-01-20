'use strict';

module.exports = function (t, year, DaysInYear) {
	t.ok(year >= 5, 'ES5+');

	t.equal(DaysInYear(2021), 365, '2021 is not a leap year');
	t.equal(DaysInYear(2020), 366, '2020 is a leap year');
	t.equal(DaysInYear(2019), 365, '2019 is not a leap year');
	t.equal(DaysInYear(2018), 365, '2018 is not a leap year');
	t.equal(DaysInYear(2017), 365, '2017 is not a leap year');
	t.equal(DaysInYear(2016), 366, '2016 is a leap year');
	t.equal(DaysInYear(2000), 366, '2000 is a leap year');
	t.equal(DaysInYear(1900), 365, '1900 is not a leap year');
};
