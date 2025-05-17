'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberAdd) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberAdd(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberAdd(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberAdd(+Infinity, +Infinity), +Infinity, '+∞ + +∞ is +∞');
	t.equal(NumberAdd(-Infinity, -Infinity), -Infinity, '-∞ + -∞ is -∞');
	t.equal(NumberAdd(+Infinity, -Infinity), NaN, '+∞ + -∞ is NaN');
	t.equal(NumberAdd(-Infinity, +Infinity), NaN, '-∞ + +∞ is NaN');

	t.equal(NumberAdd(+0, +0), +0, '0 + 0 is +0');
	t.equal(NumberAdd(+0, -0), +0, '0 + -0 is +0');
	t.equal(NumberAdd(-0, +0), +0, '-0 + 0 is +0');
	t.equal(NumberAdd(-0, -0), -0, '-0 + -0 is -0');

	forEach(v.numbers, function (number) {
		if (number !== 0) {
			t.equal(NumberAdd(number, 0), number, debug(number) + ' + 0 adds to ' + number);
		}
		t.equal(NumberAdd(number, 1), number + 1, debug(number) + ' + 1 adds to ' + (number + 1));
		t.equal(NumberAdd(1, number), number + 1, '1 + ' + debug(number) + ' adds to ' + (number + 1));
		t.equal(NumberAdd(number, -42), number - 42, debug(number) + ' + -42 adds to ' + (number - 42));
		t.equal(NumberAdd(-42, number), number - 42, '-42 + ' + debug(number) + ' adds to ' + (number - 42));
	});
};
