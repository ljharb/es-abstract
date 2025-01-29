'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::lessThan'>} */
module.exports = function (t, year, BigIntLessThan) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntLessThan(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				// @ts-expect-error
				function () { BigIntLessThan(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				// @ts-expect-error
				function () { BigIntLessThan(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.equal(BigIntLessThan(BigInt(0), BigInt(0)), false, '0n < 0n is false');

		forEach(v.bigints, function (bigint) {
			st.equal(BigIntLessThan(bigint, bigint), false, debug(bigint) + ' is not less than itself');

			st.equal(BigIntLessThan(bigint, bigint + BigInt(1)), true, debug(bigint) + ' < ' + debug(bigint + BigInt(1)) + ' is true');
			st.equal(BigIntLessThan(bigint + BigInt(1), bigint), false, debug(bigint + BigInt(1)) + ' < ' + debug(bigint) + ' is false');
		});

		st.end();
	});
};
