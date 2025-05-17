'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntSubtract) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntSubtract(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntSubtract(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntSubtract(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.equal(BigIntSubtract(BigInt(0), BigInt(0)), BigInt(0), '0n - 0n is 0n');

		forEach(v.bigints, function (bigint) {
			st.equal(BigIntSubtract(bigint, BigInt(0)), bigint, debug(bigint) + ' - 0n produces ' + bigint);
			st.equal(BigIntSubtract(bigint, BigInt(1)), bigint - BigInt(1), debug(bigint) + ' - 1n produces ' + (bigint + BigInt(1)));
			st.equal(BigIntSubtract(bigint, BigInt(42)), bigint - BigInt(42), debug(bigint) + ' - 42n produces ' + (bigint - BigInt(42)));
		});

		st.end();
	});
};
