'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntDivide) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntDivide(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntDivide(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st['throws'](
			function () { BigIntDivide(BigInt(1), BigInt(0)); },
			RangeError,
			'dividing by zero throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntDivide(bigint, bigint), BigInt(1), debug(bigint) + ' divided by itself is 1n');
				st.equal(BigIntDivide(bigint, BigInt(2)), bigint / BigInt(2), debug(bigint) + ' divided by 2n is half itself');
			}
		});

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { BigIntDivide('0'); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});
};
