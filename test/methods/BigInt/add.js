'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntAdd) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntAdd(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntAdd(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntAdd(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.equal(BigIntAdd(BigInt(0), BigInt(0)), BigInt(0), '0n + 0n is 0n');

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntAdd(bigint, BigInt(0)), bigint, debug(bigint) + ' + 0n adds to ' + bigint);
			}
			st.equal(BigIntAdd(bigint, BigInt(1)), bigint + BigInt(1), debug(bigint) + ' + 1n adds to ' + (bigint + BigInt(1)));
			st.equal(BigIntAdd(bigint, -BigInt(42)), bigint - BigInt(42), debug(bigint) + ' + -42n adds to ' + (bigint - BigInt(42)));
		});

		st.end();
	});
};
