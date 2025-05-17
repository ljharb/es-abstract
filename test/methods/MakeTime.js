'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, MakeTime) {
	t.ok(year >= 5, 'ES5+');

	forEach(esV.nonFiniteNumbers, function (nonFiniteNumber) {
		t.equal(MakeTime(nonFiniteNumber, 0, 0, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `hour`');
		t.equal(MakeTime(0, nonFiniteNumber, 0, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `min`');
		t.equal(MakeTime(0, 0, nonFiniteNumber, 0), NaN, debug(nonFiniteNumber) + ' is not a finite `sec`');
		t.equal(MakeTime(0, 0, 0, nonFiniteNumber), NaN, debug(nonFiniteNumber) + ' is not a finite `ms`');
	});

	t.equal(
		MakeTime(1.2, 2.3, 3.4, 4.5),
		(1 * esV.msPerHour) + (2 * esV.msPerMinute) + (3 * esV.msPerSecond) + 4,
		'all numbers are converted to integer, multiplied by the right number of ms, and summed'
	);
};
