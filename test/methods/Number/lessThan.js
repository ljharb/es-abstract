'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberLessThan) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberLessThan(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberLessThan(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberLessThan(+0, -0), false, '+0 < -0 is false');
	t.equal(NumberLessThan(+0, +0), false, '+0 < +0 is false');
	t.equal(NumberLessThan(-0, +0), false, '-0 < +0 is false');
	t.equal(NumberLessThan(-0, -0), false, '-0 < -0 is false');

	t.equal(NumberLessThan(NaN, NaN), undefined, 'NaN < NaN is undefined');

	t.equal(NumberLessThan(+Infinity, +Infinity), false, '+∞ < +∞ is false');
	t.equal(NumberLessThan(+Infinity, -Infinity), false, '+∞ < -∞ is false');
	t.equal(NumberLessThan(-Infinity, +Infinity), true, '-∞ < +∞ is true');
	t.equal(NumberLessThan(-Infinity, -Infinity), false, '-∞ < -∞ is false');

	forEach([].concat(
		v.numbers,
		v.infinities
	), function (number) {
		t.equal(NumberLessThan(NaN, number), undefined, 'NaN < ' + debug(number) + ' is undefined');
		t.equal(NumberLessThan(number, NaN), undefined, debug(number) + ' < NaN is undefined');

		t.equal(NumberLessThan(number, number), false, debug(number) + ' is not less than itself');

		if (isFinite(number)) {
			t.equal(NumberLessThan(number, number + 1), true, debug(number) + ' < ' + debug(number + 1) + ' is true');
			t.equal(NumberLessThan(number + 1, number), false, debug(number + 1) + ' < ' + debug(number) + ' is false');

			t.equal(NumberLessThan(Infinity, number), false, '+∞ < ' + debug(number) + ' is false');
			t.equal(NumberLessThan(number, Infinity), true, debug(number) + ' < +∞ is true');
			t.equal(NumberLessThan(-Infinity, number), true, '-∞ < ' + debug(number) + ' is true');
			t.equal(NumberLessThan(number, -Infinity), false, debug(number) + ' < -∞ is false');
		}
	});
};
