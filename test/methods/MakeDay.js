'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var MAX_VALUE = require('math-intrinsics/constants/maxValue');

module.exports = function (t, year, MakeDay) {
	t.ok(year >= 5, 'ES5+');

	forEach([NaN, Infinity, -Infinity, MAX_VALUE], function (nonFiniteNumber) {
		t.equal(MakeDay(nonFiniteNumber, 0, 0), NaN, 'year: ' + debug(nonFiniteNumber) + ' is not finite');
		t.equal(MakeDay(0, nonFiniteNumber, 0), NaN, 'month: ' + debug(nonFiniteNumber) + ' is not finite');
		t.equal(MakeDay(0, 0, nonFiniteNumber), NaN, 'date: ' + debug(nonFiniteNumber) + ' is not finite');
	});

	t.equal(MakeDay(MAX_VALUE, MAX_VALUE, 0), NaN, 'year: ' + debug(MAX_VALUE) + ' combined with month: ' + debug(MAX_VALUE) + ' is too large');

	var day2015 = 16687;
	t.equal(MakeDay(2015, 8, 9), day2015, '2015.09.09 is day 16687');
	var day2016 = day2015 + 366; // 2016 is a leap year
	t.equal(MakeDay(2016, 8, 9), day2016, '2015.09.09 is day 17053');
	var day2017 = day2016 + 365;
	t.equal(MakeDay(2017, 8, 9), day2017, '2017.09.09 is day 17418');
	var day2018 = day2017 + 365;
	t.equal(MakeDay(2018, 8, 9), day2018, '2018.09.09 is day 17783');
	var day2019 = day2018 + 365;
	t.equal(MakeDay(2019, 8, 9), day2019, '2019.09.09 is day 18148');
};
