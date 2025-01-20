'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntEqual) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntEqual(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntEqual(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a Number'
			);
		});

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntEqual(bigint, bigint), true, debug(bigint) + ' is equal to itself');
				st.equal(BigIntEqual(bigint, bigint + BigInt(1)), false, debug(bigint) + ' is not equal to itself plus 1n');
			}
		});

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { BigIntEqual('0'); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});
};
