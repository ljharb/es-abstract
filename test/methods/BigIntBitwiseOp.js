'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'BigIntBitwiseOp'>} */
module.exports = function (t, year, BigIntBitwiseOp) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.numbers, function (number) {
		t['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseOp('&', number, number); },
			TypeError,
			debug(number) + ' is not a BigInt'
		);
	});

	t.test('BigInt support', { skip: !esV.hasBigInts }, function (st) {
		st['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseOp('&', 1, BigInt(1)); },
			TypeError,
			'x: 1 is not a BigInt'
		);
		st['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseOp('&', BigInt(1), 1); },
			TypeError,
			'y: 1 is not a BigInt'
		);

		st['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseOp('invalid', BigInt(0), BigInt(0)); },
			TypeError,
			'throws with an invalid op'
		);

		st.equal(BigIntBitwiseOp('&', BigInt(1), BigInt(2)), BigInt(1) & BigInt(2));
		st.equal(BigIntBitwiseOp('|', BigInt(1), BigInt(2)), BigInt(1) | BigInt(2));
		st.equal(BigIntBitwiseOp('^', BigInt(1), BigInt(2)), BigInt(1) ^ BigInt(2));

		st.end();
	});
};
