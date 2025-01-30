'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var safeBigInt = require('safe-bigint');
var v = require('es-value-fixtures');

var bufferTestCases = require('../bufferTestCases.json');
var esV = require('../helpers/v');
var unserialize = require('../helpers/unserializeNumeric');

/** @type {import('../testHelpers').MethodTest<'RawBytesToNumeric' | 'RawBytesToNumber'>} */
module.exports = function (t, year, actual, extras) {
	t.ok(year >= 2017, 'ES2017+');

	var RawBytesToNumeric = year >= 2024
		? /** @type {import('../testHelpers').AOOnlyYears<'RawBytesToNumeric' | 'RawBytesToNumber', 2024>} */ (actual)
		: year >= 2020
			? /** @type {import('../testHelpers').AOOnlyYears<'RawBytesToNumeric' | 'RawBytesToNumber', 2024>} */ function RawBytesToNumeric(type, rawBytes, littleEndian) {
				return /** @type {import('../testHelpers').AOOnlyYears<'RawBytesToNumeric' | 'RawBytesToNumber', 2020 | 2021 | 2022 | 2023>} */ (actual)(
					/** @type {import('../../types').TypedArrayTypeByName<import('../../types').TypedArrayName>} */ (type.toUpperCase()),
					rawBytes,
					littleEndian
				);
			}
			: /** @type {import('../testHelpers').AOOnlyYears<'RawBytesToNumeric' | 'RawBytesToNumber', 2024>} */ function RawBytesToNumeric(type, rawBytes, littleEndian) {
				return /** @type {import('../testHelpers').AOOnlyYears<'RawBytesToNumeric' | 'RawBytesToNumber', Exclude<import('../testHelpers').TestYear, 2020 | 2021 | 2022 | 2023 | 2024>>} */ (actual)(
					/** @type {import('../../types').TypedArrayTypeByName<Exclude<import('../../types').TypedArrayName, 'BigInt64Array' | 'BigUint64Array'>>} */ (type.toUpperCase()),
					rawBytes,
					littleEndian
				);
			};

	forEach(esV.nonTATypes, function (nonTAType) {
		t['throws'](
			// @ts-expect-error
			function () { RawBytesToNumeric(nonTAType, [], false); },
			TypeError,
			debug(nonTAType) + ' is not a String, or not a TypedArray type'
		);
	});

	forEach(esV.unknowns, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { RawBytesToNumeric('INT8', nonArray, false); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});
	forEach([-1, 1.5, 256], function (nonByte) {
		t['throws'](
			// @ts-expect-error
			function () { RawBytesToNumeric('INT8', [nonByte], false); },
			TypeError,
			debug(nonByte) + ' is not a valid "byte"'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { RawBytesToNumeric('INT8', [0], nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(bufferTestCases, function (testCase, name) {
		var value = unserialize(testCase.value);
		t.test(name + ': ' + value, function (st) {
			forEach(year >= 2020 ? esV.allTypes : esV.numberTypes, function (type) {
				var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
				var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian

				var littleLittle = unserialize(result.setAsLittle.asLittle);
				var actualType = /** @type {Uppercase<typeof type>} */ (type.toUpperCase());
				try {
					st.equal(
						RawBytesToNumeric(actualType, result.setAsLittle.bytes, true),
						littleLittle,
						type + ', little-endian: bytes (' + debug(result.setAsLittle.bytes) + ') for ' + debug(littleLittle) + ' produces it'
					);
				} catch (e) {
					if (safeBigInt !== BigInt && e instanceof RangeError) {
						st.comment('SKIP node v10.4-v10.8 have a bug where you can‘t `BigInt(x)` anything larger than MAX_SAFE_INTEGER');
						return;
					}
				}
				if (hasBigEndian) {
					var bigBig = unserialize(result.setAsBig.asBig);
					st.equal(
						RawBytesToNumeric(actualType, result.setAsBig.bytes, false),
						bigBig,
						type + ', big-endian: bytes (' + debug(result.setAsBig.bytes) + ') for ' + debug(bigBig) + ' produces it'
					);
				}
			});

			st.end();
		});
	});

	t.test('incorrect byte counts', function (st) {
		st['throws'](
			function () { RawBytesToNumeric('FLOAT32', [0, 0, 0], false); },
			RangeError,
			'Float32 with less than 4 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('FLOAT32', [0, 0, 0, 0, 0], false); },
			RangeError,
			'Float32 with more than 4 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('FLOAT64', [0, 0, 0, 0, 0, 0, 0], false); },
			RangeError,
			'Float64 with less than 8 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('FLOAT64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
			RangeError,
			'Float64 with more than 8 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('INT8', [], false); },
			RangeError,
			'Int8 with less than 1 byte throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('INT8', [0, 0], false); },
			RangeError,
			'Int8 with more than 1 byte throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('UINT8', [], false); },
			RangeError,
			'Uint8 with less than 1 byte throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('UINT8', [0, 0], false); },
			RangeError,
			'Uint8 with more than 1 byte throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('UINT8C', [], false); },
			RangeError,
			'Uint8C with less than 1 byte throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('UINT8C', [0, 0], false); },
			RangeError,
			'Uint8C with more than 1 byte throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('INT16', [0], false); },
			RangeError,
			'Int16 with less than 2 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('INT16', [0, 0, 0], false); },
			RangeError,
			'Int16 with more than 2 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('UINT16', [0], false); },
			RangeError,
			'Uint16 with less than 2 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('UINT16', [0, 0, 0], false); },
			RangeError,
			'Uint16 with more than 2 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('UINT16', [0, 0, 0], false); },
			RangeError,
			'Uint16 with less than 4 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('UINT16', [0, 0, 0, 0, 0], false); },
			RangeError,
			'Uint16 with more than 4 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric('UINT32', [0, 0, 0], false); },
			RangeError,
			'Uint32 with less than 4 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric('UINT32', [0, 0, 0, 0, 0], false); },
			RangeError,
			'Uint32 with more than 4 bytes throws a RangeError'
		);

		if (year >= 2020) {
			st['throws'](
				function () { RawBytesToNumeric('BIGINT64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigInt64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { RawBytesToNumeric('BIGINT64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigInt64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { RawBytesToNumeric('BIGUINT64', [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigUint64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { RawBytesToNumeric('BIGUINT64', [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigUint64 with more than 8 bytes throws a RangeError'
			);
		}

		st.end();
	});

	// eslint-disable-next-line no-shadow
	extras.testSubset('RawBytesToNumeric', year, RawBytesToNumeric, /** @type {const} */ ([2020, 2021, 2022, 2023, 2024]), function (RawBytesToNumeric) {
		t.test('bigint types, no bigints', { skip: esV.hasBigInts }, function (st) {
			st['throws'](
				function () { RawBytesToNumeric('BIGINT64', [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'BigInt64 throws a SyntaxError when BigInt is not available'
			);
			st['throws'](
				function () { RawBytesToNumeric('BIGUINT64', [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'BigUint64 throws a SyntaxError when BigInt is not available'
			);

			st.end();
		});
	});
};
