'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../../testHelpers').MethodTest<'Number::equal'>} */
module.exports = function (t, year, NumberEqual) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberEqual(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			// @ts-expect-error
			function () { NumberEqual(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberEqual(Infinity, Infinity), true, '∞ === ∞');
	t.equal(NumberEqual(-Infinity, Infinity), false, '-∞ !== ∞');
	t.equal(NumberEqual(Infinity, -Infinity), false, '∞ !== -∞');
	t.equal(NumberEqual(-Infinity, -Infinity), true, '-∞ === -∞');

	t.equal(NumberEqual(NaN, NaN), false, 'NaN !== NaN');

	t.equal(NumberEqual(Infinity, 0), false, '∞ !== 0');
	t.equal(NumberEqual(-Infinity, -0), false, '-∞ !== -0');
	t.equal(NumberEqual(Infinity, -0), false, '∞ !== -0');
	t.equal(NumberEqual(-Infinity, 0), false, '-∞ !== 0');

	t.equal(NumberEqual(+0, +0), true, '+0 === +0');
	t.equal(NumberEqual(+0, -0), true, '+0 === -0');
	t.equal(NumberEqual(-0, +0), true, '-0 === +0');
	t.equal(NumberEqual(-0, -0), true, '-0 === -0');

	forEach(v.numbers, function (number) {
		if (isFinite(number)) {
			t.equal(NumberEqual(number, number), true, debug(number) + ' is equal to itself');
			t.equal(NumberEqual(number, number + 1), false, debug(number) + ' is not equal to itself plus 1');
		}
	});
};
