'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var safeBigInt = require('safe-bigint');
var v = require('es-value-fixtures');

var specEnum = require('../../helpers/specEnum');

var bufferTestCases = require('../bufferTestCases.json');
var esV = require('../helpers/v');
var unserialize = require('../helpers/unserializeNumeric');

module.exports = function (t, year, RawBytesToNumeric) {
	t.ok(year >= 2017, 'ES2017+');

	var int8 = specEnum(year, 'int8');
	var uint8 = specEnum(year, 'uint8');
	var uint8c = specEnum(year, 'uint8c');
	var int16 = specEnum(year, 'int16');
	var uint16 = specEnum(year, 'uint16');
	var uint32 = specEnum(year, 'uint32');
	var float16 = specEnum(year, 'float16');
	var float32 = specEnum(year, 'float32');
	var float64 = specEnum(year, 'float64');
	var bigint64 = specEnum(year, 'bigint64');
	var biguint64 = specEnum(year, 'biguint64');

	forEach(esV.nonTATypes, function (nonTAType) {
		t['throws'](
			function () { RawBytesToNumeric(nonTAType, [], false); },
			TypeError,
			debug(nonTAType) + ' is not a String, or not a TypedArray type'
		);
	});

	forEach(esV.unknowns, function (nonArray) {
		t['throws'](
			function () { RawBytesToNumeric(int8, nonArray, false); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});
	forEach([-1, 1.5, 256], function (nonByte) {
		t['throws'](
			function () { RawBytesToNumeric(int8, [nonByte], false); },
			TypeError,
			debug(nonByte) + ' is not a valid "byte"'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { RawBytesToNumeric(int8, [0], nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(bufferTestCases, function (testCase, name) {
		var value = unserialize(testCase.value);
		t.test(name + ': ' + value, function (st) {
			forEach(esV.getTATypes(year), function (type) {
				var typeForYear = specEnum(year, type.toLowerCase());
				var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
				var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian

				var littleLittle = unserialize(result.setAsLittle.asLittle);
				try {
					st.equal(
						RawBytesToNumeric(typeForYear, result.setAsLittle.bytes, true),
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
						RawBytesToNumeric(typeForYear, result.setAsBig.bytes, false),
						bigBig,
						type + ', big-endian: bytes (' + debug(result.setAsBig.bytes) + ') for ' + debug(bigBig) + ' produces it'
					);
				}
			});

			st.end();
		});
	});

	t.test('incorrect byte counts', function (st) {
		if (year >= 2025) {
			st['throws'](
				function () { RawBytesToNumeric(float16, [0], false); },
				RangeError,
				'Float16 with less than 2 bytes throws a RangeError'
			);
			st['throws'](
				function () { RawBytesToNumeric(float16, [0, 0, 0], false); },
				RangeError,
				'Float16 with more than 2 bytes throws a RangeError'
			);
		}

		st['throws'](
			function () { RawBytesToNumeric(float32, [0, 0, 0], false); },
			RangeError,
			'Float32 with less than 4 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(float32, [0, 0, 0, 0, 0], false); },
			RangeError,
			'Float32 with more than 4 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(float64, [0, 0, 0, 0, 0, 0, 0], false); },
			RangeError,
			'Float64 with less than 8 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(float64, [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
			RangeError,
			'Float64 with more than 8 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(int8, [], false); },
			RangeError,
			'Int8 with less than 1 byte throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(int8, [0, 0], false); },
			RangeError,
			'Int8 with more than 1 byte throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(uint8, [], false); },
			RangeError,
			'Uint8 with less than 1 byte throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(uint8, [0, 0], false); },
			RangeError,
			'Uint8 with more than 1 byte throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(uint8c, [], false); },
			RangeError,
			'Uint8C with less than 1 byte throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(uint8c, [0, 0], false); },
			RangeError,
			'Uint8C with more than 1 byte throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(int16, [0], false); },
			RangeError,
			'Int16 with less than 2 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(int16, [0, 0, 0], false); },
			RangeError,
			'Int16 with more than 2 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(uint16, [0], false); },
			RangeError,
			'Uint16 with less than 2 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(uint16, [0, 0, 0], false); },
			RangeError,
			'Uint16 with more than 2 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(uint16, [0, 0, 0], false); },
			RangeError,
			'Uint16 with less than 4 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(uint16, [0, 0, 0, 0, 0], false); },
			RangeError,
			'Uint16 with more than 4 bytes throws a RangeError'
		);

		st['throws'](
			function () { RawBytesToNumeric(uint32, [0, 0, 0], false); },
			RangeError,
			'Uint32 with less than 4 bytes throws a RangeError'
		);
		st['throws'](
			function () { RawBytesToNumeric(uint32, [0, 0, 0, 0, 0], false); },
			RangeError,
			'Uint32 with more than 4 bytes throws a RangeError'
		);

		if (year >= 2020) {
			st['throws'](
				function () { RawBytesToNumeric(bigint64, [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigInt64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { RawBytesToNumeric(bigint64, [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigInt64 with more than 8 bytes throws a RangeError'
			);

			st['throws'](
				function () { RawBytesToNumeric(biguint64, [0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigUint64 with less than 8 bytes throws a RangeError'
			);
			st['throws'](
				function () { RawBytesToNumeric(biguint64, [0, 0, 0, 0, 0, 0, 0, 0, 0], false); },
				RangeError,
				'BigUint64 with more than 8 bytes throws a RangeError'
			);
		}

		st.end();
	});

	if (year >= 2020) {
		t.test('bigint types, no bigints', { skip: esV.hasBigInts }, function (st) {
			st['throws'](
				function () { RawBytesToNumeric(bigint64, [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'BigInt64 throws a SyntaxError when BigInt is not available'
			);
			st['throws'](
				function () { RawBytesToNumeric(biguint64, [0, 0, 0, 0, 0, 0, 0, 0], false); },
				SyntaxError,
				'BigUint64 throws a SyntaxError when BigInt is not available'
			);

			st.end();
		});
	}
};
