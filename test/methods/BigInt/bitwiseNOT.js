'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::bitwiseNOT'>} */
module.exports = function (t, year, BigIntBitwiseNOT) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				// @ts-expect-error
				function () { BigIntBitwiseNOT(nonBigInt); },
				TypeError,
				debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st.test('actual BigInts', { skip: !esV.hasBigInts }, function (s2t) {
			forEach(v.int32s, function (int32) {
				var bigInt32 = BigInt(int32);
				s2t.equal(BigIntBitwiseNOT(bigInt32), ~bigInt32, debug(bigInt32) + ' becomes ~' + debug(bigInt32));
			});
			s2t.end();
		});

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			// @ts-expect-error
			function () { BigIntBitwiseNOT('0'); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});
};
