'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntMultiply) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntMultiply(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntMultiply(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntMultiply(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a Number'
			);
		});

		st.equal(BigIntMultiply(BigInt(0), BigInt(0)), BigInt(0), '0n * 0n is 0n');

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntMultiply(bigint, BigInt(0)), BigInt(0), debug(bigint) + ' * 0n produces 0n');
				st.equal(BigIntMultiply(bigint, BigInt(1)), bigint, debug(bigint) + ' * 1n produces itself');
				st.equal(BigIntMultiply(bigint, -BigInt(42)), bigint * -BigInt(42), debug(bigint) + ' * -42n produces ' + (bigint - BigInt(42)));
			}
		});

		st.end();
	});
};
