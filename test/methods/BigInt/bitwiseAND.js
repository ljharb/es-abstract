'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::bitwiseAND'>} */
module.exports = function (t, year, BigIntBitwiseAND) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				// @ts-expect-error
				function () { BigIntBitwiseAND(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				// @ts-expect-error
				function () { BigIntBitwiseAND(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.equal(BigIntBitwiseAND(BigInt(1), BigInt(2)), BigInt(1) & BigInt(2));

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseAND('0'); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});
};
