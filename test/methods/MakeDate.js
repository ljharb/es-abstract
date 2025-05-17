'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');

var esV = require('../helpers/v');

module.exports = function (t, year, MakeDate) {
	t.ok(year >= 5, 'ES5+');

	forEach(esV.nonFiniteNumbers, function (nonFiniteNumber) {
		t.equal(MakeDate(nonFiniteNumber, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `day`');
		t.equal(MakeDate(0, nonFiniteNumber), NaN, debug(nonFiniteNumber) + ' is not a finite `time`');
	});

	t.equal(MakeDate(0, 0), 0, 'zero day and zero time is zero date');
	t.equal(MakeDate(0, 123), 123, 'zero day and nonzero time is a date of the "time"');
	t.equal(MakeDate(1, 0), esV.msPerDay, 'day of 1 and zero time is a date of "ms per day"');
	t.equal(MakeDate(3, 0), 3 * esV.msPerDay, 'day of 3 and zero time is a date of thrice "ms per day"');
	t.equal(MakeDate(1, 123), esV.msPerDay + 123, 'day of 1 and nonzero time is a date of "ms per day" plus the "time"');
	t.equal(MakeDate(3, 123), (3 * esV.msPerDay) + 123, 'day of 3 and nonzero time is a date of thrice "ms per day" plus the "time"');
};
