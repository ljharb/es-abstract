'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'NumberBitwiseOp'>} */
module.exports = function (t, year, NumberBitwiseOp) {
	t.ok(year >= 2020, 'ES2020+');

	t['throws'](
		// @ts-expect-error
		function () { NumberBitwiseOp('invalid', 0, 0); },
		TypeError,
		'throws with an invalid op'
	);

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberBitwiseOp('&', nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			// @ts-expect-error
			function () { NumberBitwiseOp('&', 0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberBitwiseOp('&', 1, 2), 1 & 2);
	t.equal(NumberBitwiseOp('|', 1, 2), 1 | 2);
	t.equal(NumberBitwiseOp('^', 1, 2), 1 ^ 2);
};
