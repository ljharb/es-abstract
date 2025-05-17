'use strict';

var arrayFrom = require('array.from');
var assign = require('object.assign');
var availableTypedArrays = require('available-typed-arrays')();
var debug = require('object-inspect');
var forEach = require('for-each');
var safeBigInt = require('safe-bigint');
var v = require('es-value-fixtures');

var bufferTestCases = require('../bufferTestCases.json');
var esV = require('../helpers/v');
var unserialize = require('../helpers/unserializeNumeric');

module.exports = function (t, year, NumericToRawBytes) {
	t.ok(year >= 2017, 'ES2017+');

	forEach(esV.nonTATypes, function (nonTAType) {
		t['throws'](
			function () { NumericToRawBytes(nonTAType, 0, false); },
			TypeError,
			debug(nonTAType) + ' is not a String, or not a TypedArray type'
		);
	});

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumericToRawBytes(year >= 2024 ? 'INT8' : 'Int8', nonNumber, false); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { NumericToRawBytes(year >= 2024 ? 'INT8' : 'Int8', 0, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(bufferTestCases, function (testCase, name) {
		var value = unserialize(testCase.value);

		t.test(name + ': ' + value, function (st) {
			forEach(year >= 2020 ? esV.allTypes : esV.numberTypes, function (type) {
				var isBigInt = esV.isBigIntTAType(type);
				var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
				var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];

				if (isBigInt && (!isFinite(value) || Math.floor(value) !== value)) {
					return;
				}

				var valToSet = type === 'Uint8C' && value > 0xFF ? 0xFF : isBigInt ? safeBigInt(value) : value;

				st.test(type, function (s2t) {
					/*
					s2t.equal(
						GetValueFromBuffer(testCase.buffer, 0, type, true, 'Unordered'),
						defaultEndianness === testCase.endian ? testCase[type].little.value : testCase[type].big.value,
						'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
					);
					*/

					s2t.deepEqual(
						NumericToRawBytes(year >= 2024 ? type.toUpperCase() : type, valToSet, true),
						result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes,
						debug(value) + ' with type ' + type + ', little endian, yields expected value'
					);

					if (hasBigEndian) {
						s2t.deepEqual(
							NumericToRawBytes(year >= 2024 ? type.toUpperCase() : type, valToSet, false),
							result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes,
							debug(value) + ' with type ' + type + ', big endian, yields expected value'
						);
					}

					s2t.end();
				});
			});

			st.end();
		});
	});

	if (year >= 2020) {
		t.test('BigInt64', function (st) {
			st.test('bigints available', { skip: !esV.hasBigInts }, function (s2t) {
				forEach([
					[BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
					[BigInt(1), [1, 0, 0, 0, 0, 0, 0, 0]],
					// [BigInt(-1), [255, 255, 255, 255, 255, 255, 255, 255]],
					[BigInt(16777216), [0, 0, 0, 1, 0, 0, 0, 0]], // max safe float32
					[BigInt(2147483647), [255, 255, 255, 127, 0, 0, 0, 0]],
					// [BigInt(-2147483647), [1, 0, 0, 128, 255, 255, 255, 255]],
					[BigInt(2147483648), [0, 0, 0, 128, 0, 0, 0, 0]]
				// [BigInt(-2147483648), [0, 0, 0, 128, 255, 255, 255, 255]]
				], function (pair) {
					var int = pair[0];
					var bytes = pair[1];

					if (availableTypedArrays.length > 0) {
						var expectedBytes = arrayFrom(new Uint8Array(assign(new BigInt64Array(1), [int]).buffer));
						s2t.deepEqual(
							bytes,
							expectedBytes,
							'bytes for ' + debug(int) + ' are correct; got ' + debug(expectedBytes)
						);
					}

					var type = year >= 2024 ? 'BIGINT64' : 'BigInt64';
					s2t.deepEqual(
						NumericToRawBytes(type, int, true),
						bytes,
						'little-endian: bytes for ' + debug(int) + ' are produced'
					);
					s2t.deepEqual(
						NumericToRawBytes(type, int, false),
						bytes.slice().reverse(),
						'big-endian: bytes for ' + debug(int) + ' are produced'
					);
				});

				s2t.end();
			});

			st.end();
		});

		t.test('BigUint64', function (st) {
			st.test('bigints available', { skip: !esV.hasBigInts }, function (s2t) {
				forEach([
					[BigInt(0), [0, 0, 0, 0, 0, 0, 0, 0]],
					[BigInt(1), [1, 0, 0, 0, 0, 0, 0, 0]],
					// [BigInt(-1), [255, 255, 255, 255, 255, 255, 255, 255]],
					[BigInt(16777216), [0, 0, 0, 1, 0, 0, 0, 0]], // max safe float32
					[BigInt(2147483647), [255, 255, 255, 127, 0, 0, 0, 0]],
					// [BigInt(-2147483647), [1, 0, 0, 128, 255, 255, 255, 255]],
					[BigInt(2147483648), [0, 0, 0, 128, 0, 0, 0, 0]]
				// [BigInt(-2147483648), [0, 0, 0, 128, 255, 255, 255, 255]]
				], function (pair) {
					var int = pair[0];
					var bytes = pair[1];

					if (availableTypedArrays.length > 0) {
						var expectedBytes = arrayFrom(new Uint8Array(assign(new BigUint64Array(1), [int]).buffer));
						s2t.deepEqual(
							bytes,
							expectedBytes,
							'bytes for ' + debug(int) + ' are correct; got ' + debug(expectedBytes)
						);
					}

					var type = year >= 2024 ? 'BIGUINT64' : 'BigUint64';
					s2t.deepEqual(
						NumericToRawBytes(type, int, true),
						bytes,
						'little-endian: bytes for ' + debug(int) + ' are produced'
					);
					s2t.deepEqual(
						NumericToRawBytes(type, int, false),
						bytes.slice().reverse(),
						'big-endian: bytes for ' + debug(int) + ' are produced'
					);
				});

				s2t.end();
			});

			st.end();
		});
	}
};
