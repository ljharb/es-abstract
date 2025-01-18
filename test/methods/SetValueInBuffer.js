'use strict';

var arrayFrom = require('array.from');
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var safeBigInt = require('safe-bigint');

var bufferTestCases = require('../bufferTestCases.json');

var clearBuffer = require('../helpers/clearBuffer');
var unserialize = require('../helpers/unserializeNumeric');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'SetValueInBuffer'>} */
module.exports = function (t, year, actual, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var order = year >= 2024 ? 'UNORDERED' : 'Unordered';

	var SetValueInBuffer = year >= 2017
		? actual
		: /** @type {import('../testHelpers').AOOnlyYears<'SetValueInBuffer', 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024>} */ function SetValueInBuffer(arrayBuffer, byteIndex, type, value) {
			if (arguments.length > 6) {
				return /** @type {import('../testHelpers').AOOnlyYears<'SetValueInBuffer', 5 | 2015 | 2016>} */ (actual)(arrayBuffer, byteIndex, type, value, arguments[6]);
			}
			return /** @type {import('../testHelpers').AOOnlyYears<'SetValueInBuffer', 5 | 2015 | 2016>} */ (actual)(arrayBuffer, byteIndex, type, value);
		};

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach([true, false], function (bool) {
		forEach(esV.unknowns, function (nonAB) {
			t['throws'](
				function () { SetValueInBuffer(nonAB, 0, year >= 2024 ? 'INT8' : 'Int8', 0, bool, order); },
				TypeError,
				debug(nonAB) + ' is not an ArrayBuffer (isTypedArray ' + bool + ')'
			);
		});
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		if (year >= 2020) {
			st.test('BigInts', { skip: !esV.hasBigInts }, function (s2t) {
				s2t['throws'](
					function () { SetValueInBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', BigInt(0), true, order); },
					TypeError,
					debug(BigInt(0)) + ' is not a number, but the given type requires one'
				);

				s2t['throws'](
					function () { SetValueInBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'BIGUINT64' : 'BigUint64', 0, true, order); },
					TypeError,
					debug(0) + ' is not a bigint, but the given type requires one'
				);

				forEach(v.bigints, function (bigint) {
					var buffer = new ArrayBuffer(8);
					SetValueInBuffer(buffer, 0, year >= 2024 ? 'BIGUINT64' : 'BigUint64', bigint, true, order);
					s2t.equal(
						new BigUint64Array(buffer)[0],
						bigint,
						debug(bigint) + ' is set'
					);
				});

				s2t.end();
			});
		}

		forEach([true, false], function (bool) {
			forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
				st['throws'](
					function () { SetValueInBuffer(new ArrayBuffer(8), nonNonNegativeInteger, year >= 2024 ? 'INT8' : 'Int8', 0, bool, order); },
					TypeError,
					debug(nonNonNegativeInteger) + ' is not a valid byte index (isTypedArray ' + bool + ')'
				);
			});
		});

		forEach([true, false], function (bool) {
			forEach(esV.invalidTATypes, function (nonString) {
				st['throws'](
					// @ts-expect-error
					function () { SetValueInBuffer(new ArrayBuffer(8), 0, nonString, 0, bool, order); },
					TypeError,
					'type: ' + debug(nonString) + ' is not a valid String (or type) value (isTypedArray ' + bool + ')'
				);
			});
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			st['throws'](
				function () { SetValueInBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', 0, nonBoolean, false, order); },
				TypeError,
				'isTypedArray: ' + debug(nonBoolean) + ' is not a valid Boolean value'
			);

			st['throws'](
				function () { SetValueInBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', 0, true, order, nonBoolean); },
				TypeError,
				'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
			);
		});

		forEach([true, false], function (bool) {
			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { SetValueInBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', nonNumber, bool, order); },
					TypeError,
					debug(nonNumber) + ' is not a valid Number or BigInt value (isTypedArray ' + bool + ')'
				);
			});

			if (year >= 2017) {
				st['throws'](
					function () { SetValueInBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', 0, bool, 'invalid order'); },
					TypeError,
					'invalid order (isTypedArray ' + bool + ')'
				);
			}
		});

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			var buffer = new ArrayBuffer(8);
			s2t.equal(DetachArrayBuffer(buffer), null, 'detaching returns null');

			forEach([true, false], function (bool) {
				s2t['throws'](
					function () { SetValueInBuffer(buffer, 0, year >= 2024 ? 'INT8' : 'Int8', 0, bool, order); },
					TypeError,
					'detached buffers throw (isTypedArray ' + bool + ')'
				);
			});

			s2t.end();
		});

		forEach(bufferTestCases, function (testCase) {
			forEach(year >= 2020 ? esV.allTypes : esV.numberTypes, function (type) {
				var isBigInt = esV.isBigIntTAType(type);
				var Z = isBigInt ? safeBigInt : Number;
				var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
				var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
				var value = unserialize(testCase.value);

				var elementSize = esV.elementSizes[/** @type {`$${typeof type extends 'Uint8C' ? 'Uint8Clamped' : Exclude<typeof type, 'Uint8C'>}Array`} */ ('$' + (type === 'Uint8C' ? 'Uint8Clamped' : type) + 'Array')];

				var buffer = new ArrayBuffer(esV.elementSizes.$Float64Array);

				if (isBigInt) {
					st['throws'](
						function () { SetValueInBuffer(buffer, 0, year >= 2024 ? type.toUpperCase() : type, 0, false, order, true); },
						TypeError,
						'bigint type throws with a Number value'
					);
				}

				if (isBigInt && (!isFinite(value) || Math.floor(value) !== value)) {
					return;
				}

				var valToSet = type === 'Uint8C' && value > 255 ? 255 : Z(value);

				/*
				st.equal(
					SetValueInBuffer(testCase.buffer, 0, type, true, 'Unordered'),
					defaultEndianness === testCase.endian ? testCase[type].little.value] : testCase[type].big.value,
					'buffer holding ' + debug(testCase.value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
				);
				*/
				var copyBytes = new Uint8Array(buffer);

				clearBuffer(buffer);

				st.equal(
					SetValueInBuffer(buffer, 0, year >= 2024 ? type.toUpperCase() : type, valToSet, false, order, true),
					void undefined,
					'returns undefined'
				);
				st.deepEqual(
					arrayFrom(Array.prototype.slice.call(copyBytes, 0, elementSize)),
					arrayFrom(Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsLittle' : 'setAsTruncatedLittle'].bytes), 0, elementSize)),
					'buffer holding ' + debug(value) + ' with type ' + type + ', little endian, yields expected value'
				);

				if (hasBigEndian) {
					clearBuffer(buffer);

					st.equal(
						SetValueInBuffer(buffer, 0, year >= 2024 ? type.toUpperCase() : type, valToSet, false, order, false),
						void undefined,
						'returns undefined'
					);
					st.deepEqual(
						arrayFrom(Array.prototype.slice.call(copyBytes, 0, elementSize)),
						arrayFrom(Array.prototype.slice.call(new Uint8Array(result[type === 'Float64' ? 'setAsBig' : 'setAsTruncatedBig'].bytes), 0, elementSize)),
						'buffer holding ' + debug(value) + ' with type ' + type + ', big endian, yields expected value'
					);
				}
			});
		});

		st.end();
	});

	if (year >= 2022) {
		t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			st['throws'](
				function () { SetValueInBuffer(new SharedArrayBuffer(0), 0, year >= 2024 ? 'INT8' : 'Int8', 0, true, order); },
				SyntaxError,
				'SAB not yet supported'
			);

			st.end();
		});
	}
};
