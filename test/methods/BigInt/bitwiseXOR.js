'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::bitwiseXOR'>} */
module.exports = function (t, year, BigIntBitwiseXOR) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				// @ts-expect-error
				function () { BigIntBitwiseXOR(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				// @ts-expect-error
				function () { BigIntBitwiseXOR(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.equal(BigIntBitwiseXOR(BigInt(1), BigInt(2)), BigInt(1) ^ BigInt(2));

		st.test('BigInt not supported', { skip: esV.hasBigInts }, function (s2t) {
			s2t['throws'](
				// @ts-expect-error
				function () { BigIntBitwiseXOR('0'); },
				SyntaxError,
				'throws a SyntaxError when BigInt is not available'
			);

			s2t.end();
		});

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseXOR('0'); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});
};
