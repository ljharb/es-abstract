'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::remainder'>} */
module.exports = function (t, year, BigIntRemainder) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntRemainder(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				// @ts-expect-error
				function () { BigIntRemainder(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				// @ts-expect-error
				function () { BigIntRemainder(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st['throws'](
			function () { BigIntRemainder(BigInt(1), BigInt(0)); },
			RangeError,
			'dividing by zero throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(
					BigIntRemainder(BigInt(0), bigint),
					BigInt(0),
					'0n % ' + debug(bigint) + ' is 0n'
				);
				st.equal(
					BigIntRemainder(bigint + BigInt(1), bigint),
					BigInt(1),
					debug(bigint) + ' % ' + debug(bigint + BigInt(1)) + ' is 1n'
				);
			}
		});

		st.end();
	});
};
