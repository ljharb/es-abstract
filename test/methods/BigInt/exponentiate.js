'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var mockProperty = require('mock-property');

var esV = require('../../helpers/v');

var rerequire = require('../../helpers/rerequire');

module.exports = function (t, year, BigIntExponentiate) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { BigIntExponentiate(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.nonBigInts, function (nonBigInt) {
			st['throws'](
				function () { BigIntExponentiate(nonBigInt, BigInt(0)); },
				TypeError,
				'base: ' + debug(nonBigInt) + ' is not a BigInt'
			);
			st['throws'](
				function () { BigIntExponentiate(BigInt(0), nonBigInt); },
				TypeError,
				'exponent: ' + debug(nonBigInt) + ' is not a BigInt'
			);
		});

		st['throws'](
			function () { BigIntExponentiate(BigInt(1), -BigInt(1)); },
			RangeError,
			'negative exponent throws'
		);

		forEach(v.bigints, function (bigint) {
			if (bigint !== BigInt(0)) {
				st.equal(BigIntExponentiate(bigint, BigInt(0)), BigInt(1), debug(bigint) + ' ** 0n is 1n');

				var square = BigInt(1);
				for (var i = 0; i < Number(bigint); i += 1) {
					square *= bigint;
				}
				st.equal(BigIntExponentiate(bigint, bigint), square, debug(bigint) + ' ** ' + debug(bigint) + ' is equal to ' + debug(square));
			}
		});

		forEach([
			[BigInt(2), BigInt(10), BigInt(1024)],
			[BigInt(3), BigInt(3), BigInt(27)],
			[BigInt(2), BigInt(1), BigInt(2)],
			[BigInt(1), BigInt(5), BigInt(1)],
			[BigInt(0), BigInt(5), BigInt(0)],
			[BigInt(2), BigInt(40), BigInt(1099511627776)]
		], function (testCase) {
			var base = testCase[0];
			var exponent = testCase[1];
			var expected = testCase[2];
			// before the fix this returned `base + (exponent * exponent)`, e.g. `2n ** 10n` was `102n` not `1024n`
			st.equal(BigIntExponentiate(base, exponent), expected, debug(base) + ' ** ' + debug(exponent) + ' is ' + debug(expected));
		});

		st.end();
	});

	t.test('throws when %BigInt% intrinsic is absent', { skip: !esV.hasBigInts }, function (st) {
		var bigTwo = BigInt(2);
		var bigThree = BigInt(3);
		var aoPath = require.resolve('../../../' + year + '/BigInt/exponentiate');
		st.teardown(mockProperty(global, 'BigInt', { value: undefined }));
		st.teardown(rerequire(aoPath, require.resolve('get-intrinsic')));
		var Fresh = require(aoPath); // eslint-disable-line global-require
		st['throws'](
			function () { Fresh(bigTwo, bigThree); },
			/BigInt is not supported/,
			'guard throws explicit "BigInt is not supported"'
		);
		st.end();
	});
};
