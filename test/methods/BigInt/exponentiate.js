'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::exponentiate'>} */
module.exports = function (t, year, BigIntExponentiate) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntExponentiate(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				// @ts-expect-error
				function () { BigIntExponentiate(nonBigInt, BigInt(0)); },
				TypeError,
				'base: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				// @ts-expect-error
				function () { BigIntExponentiate(BigInt(0), nonBigInt); },
				TypeError,
				'exponent: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st['throws'](
			function () { BigIntExponentiate(BigInt(1), -BigInt(1)); },
			RangeError,
			'negative exponent throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntExponentiate(bigint, BigInt(0)), BigInt(1), debug(bigint) + ' ** 0n is 1n');

				var square = bigint;
				for (var i = 0; i < Number(bigint); i += 1) {
					square += bigint;
				}
				st.equal(BigIntExponentiate(bigint, bigint), square, debug(bigint) + ' ** ' + debug(bigint) + ' is equal to ' + debug(square));
			}
		});

		st.end();
	});
};
