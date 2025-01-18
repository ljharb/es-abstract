'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../../testHelpers').MethodTest<'Number::divide'>} */
module.exports = function (t, year, NumberDivide) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberDivide(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			// @ts-expect-error
			function () { NumberDivide(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberDivide(Infinity, Infinity), NaN, '∞ / ∞ is NaN');
	t.equal(NumberDivide(-Infinity, Infinity), NaN, '-∞ / ∞ is NaN');
	t.equal(NumberDivide(Infinity, -Infinity), NaN, '∞ / -∞ is NaN');
	t.equal(NumberDivide(-Infinity, -Infinity), NaN, '-∞ / -∞ is NaN');

	t.equal(NumberDivide(NaN, NaN), NaN, 'NaN / NaN is NaN');

	t.equal(NumberDivide(+Infinity, +0), +Infinity, '+∞ / +0 is +∞');
	t.equal(NumberDivide(-Infinity, -0), +Infinity, '-∞ / -0 is +∞');
	t.equal(NumberDivide(+Infinity, -0), -Infinity, '+∞ / -0 is -∞');
	t.equal(NumberDivide(-Infinity, +0), -Infinity, '-∞ / +0 is -∞');

	t.equal(NumberDivide(+0, +Infinity), +0, '+0 / +∞ is +0');
	t.equal(NumberDivide(-0, -Infinity), +0, '-0 / -∞ is +0');
	t.equal(NumberDivide(-0, +Infinity), -0, '-0 / +∞ is -0');
	t.equal(NumberDivide(+0, -Infinity), -0, '+0 / -∞ is -0');

	forEach(v.numbers, function (number) {
		if (number !== 0 && isFinite(number)) {
			t.equal(NumberDivide(number, number), 1, debug(number) + ' divided by itself is 1');
			t.equal(NumberDivide(number, 2), number / 2, debug(number) + ' divided by 2 is half itself');
		}
	});
};
