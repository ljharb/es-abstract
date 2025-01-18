'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../../testHelpers').MethodTest<'Number::sameValue'>} */
module.exports = function (t, year, NumberSameValue) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberSameValue(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			// @ts-expect-error
			function () { NumberSameValue(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberSameValue(NaN, NaN), true, 'NaN is the sameValue as NaN');

	t.equal(NumberSameValue(+0, +0), true, '+0 is sameValue as +0');
	t.equal(NumberSameValue(+0, -0), false, '+0 is not sameValue as -0');
	t.equal(NumberSameValue(-0, +0), false, '-0 is not sameValue as +0');
	t.equal(NumberSameValue(-0, -0), true, '-0 is sameValue as -0');

	forEach(v.numbers, function (number) {
		t.ok(NumberSameValue(number, number), debug(number) + ' is the sameValue as itself');
	});
};
