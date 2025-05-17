'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberRemainder) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberRemainder(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberRemainder(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberRemainder(NaN, NaN), NaN, 'NaN % NaN is NaN');

	t.equal(NumberRemainder(+0, +0), NaN, '+0 % +0 is NaN');
	t.equal(NumberRemainder(+0, -0), NaN, '+0 % -0 is NaN');
	t.equal(NumberRemainder(-0, +0), NaN, '-0 % +0 is NaN');
	t.equal(NumberRemainder(-0, -0), NaN, '-0 % -0 is NaN');

	forEach(v.numbers, function (number) {
		t.equal(NumberRemainder(number, NaN), NaN, debug(number) + ' % NaN is NaN');
		t.equal(NumberRemainder(NaN, number), NaN, 'NaN % ' + debug(number) + ' is NaN');

		t.equal(NumberRemainder(Infinity, number), NaN, '+∞ % ' + debug(number) + ' is NaN');
		t.equal(NumberRemainder(-Infinity, number), NaN, '-∞ % ' + debug(number) + ' is NaN');
		t.equal(NumberRemainder(number, 0), NaN, debug(number) + ' % +0 is NaN');
		t.equal(NumberRemainder(number, -0), NaN, debug(number) + ' % -0 is NaN');

		if (isFinite(number)) {
			t.equal(NumberRemainder(number, Infinity), number, debug(number) + ' % +∞ is ' + debug(number));
			t.equal(NumberRemainder(number, -Infinity), number, debug(number) + ' % -∞ is ' + debug(number));
			if (number !== 0) {
				t.equal(NumberRemainder(0, number), 0, '+0 % ' + debug(number) + ' is ' + debug(number));
				t.equal(NumberRemainder(-0, number), -0, '-0 % ' + debug(number) + ' is ' + debug(number));
				t.looseEqual(NumberRemainder(number * 2, number), 0, debug(number) + ' % ' + debug(number * 2) + ' is 0');
			}
		}
	});

	t.equal(NumberRemainder(-1, 1), -0, '-1 % 1 is -0');
};
