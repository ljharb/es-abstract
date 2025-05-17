'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntBitwiseNOT) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntBitwiseNOT(nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.int32s, function (int32) {
			var bigInt32 = BigInt(int32);
			st.equal(BigIntBitwiseNOT(bigInt32), ~bigInt32, debug(bigInt32) + ' becomes ~' + debug(bigInt32));
		});

		st.end();
	});
};
