'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../../helpers/v');

/** @type {import('../../testHelpers').MethodTest<'BigInt::toString'>} */
module.exports = function (t, year, actual) {
	t.ok(year >= 2020, 'ES2020+');

	/** @type {import('../../testHelpers').AOForYears<'BigInt::toString', 2023 | 2024>} */
	var BigIntToString = year >= 2023 ? actual : function toString(x) {
		return /** @type {import('../../testHelpers').AOForYears<'BigInt::toString', Exclude<import('../../testHelpers').TestYear, 2023 | 2024>>} */ (actual)(x);
	};

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			// @ts-expect-error
			function () { BigIntToString(nonBigInt, nonBigInt); },
			TypeError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.bigints, function (bigint) {
			st.equal(BigIntToString(bigint, 10), String(bigint), debug(bigint) + ' stringifies to ' + bigint);
		});

		if (year >= 2023) {
			forEach(/** @type {(typeof v.nonIntegerNumbers[number] | number)[]} */ ([].concat(
				// @ts-expect-error TS sucks with concat
				v.nonIntegerNumbers,
				0,
				1,
				37
			)), function (nonIntegerNumber) {
				st['throws'](
					// @ts-expect-error
					function () { BigIntToString(BigInt(0), nonIntegerNumber); },
					TypeError,
					debug(nonIntegerNumber) + ' is not an integer [2, 36]'
				);
			});

			forEach(/** @type {const} */ ([
				[37, 2, '100101'],
				[37, 3, '1101'],
				[37, 4, '211'],
				[37, 5, '122'],
				[37, 6, '101'],
				[37, 7, '52'],
				[37, 8, '45'],
				[37, 9, '41'],
				[37, 10, '37'],
				[37, 11, '34'],
				[37, 12, '31'],
				[37, 13, '2b'],
				[37, 14, '29'],
				[37, 15, '27'],
				[37, 16, '25'],
				[37, 17, '23'],
				[37, 18, '21'],
				[37, 19, '1i'],
				[37, 20, '1h'],
				[37, 21, '1g'],
				[37, 22, '1f'],
				[37, 23, '1e'],
				[37, 24, '1d'],
				[37, 25, '1c'],
				[37, 26, '1b'],
				[37, 27, '1a'],
				[37, 28, '19'],
				[37, 29, '18'],
				[37, 30, '17'],
				[37, 31, '16'],
				[37, 32, '15'],
				[37, 33, '14'],
				[37, 34, '13'],
				[37, 35, '12'],
				[37, 36, '11']
			]), function (testCase) {
				var num = BigInt(testCase[0]);
				st.equal(
					BigIntToString(num, testCase[1]),
					testCase[2],
					debug(num) + ' stringifies to ' + debug(testCase[2]) + ' in base ' + debug(testCase[1])
				);
			});
		}

		st.end();
	});
};
