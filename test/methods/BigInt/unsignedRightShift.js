'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

module.exports = function (t, year, BigIntUnsignedRightShift) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntUnsignedRightShift(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntUnsignedRightShift(nonBigInt, BigInt(0)); },
				TypeError,
				'x: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntUnsignedRightShift(BigInt(0), nonBigInt); },
				TypeError,
				'y: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		forEach([].concat(
			0,
			v.int32s
		), function (int32) {
			var bigInt32 = BigInt(int32);
			forEach([1, 3, 5, 31, 32, 33], function (bits) {
				var bitsN = BigInt(bits);
				st['throws'](
					function () { BigIntUnsignedRightShift(bigInt32, bitsN); },
					TypeError,
					debug(bigInt32) + ' >>> ' + debug(bitsN) + ' throws'
				);
			});
		});

		st.end();
	});
};
