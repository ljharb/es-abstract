'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var bufferTestCases = require('../bufferTestCases.json');
var clearBuffer = require('../helpers/clearBuffer');
var unserialize = require('../helpers/unserializeNumeric');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'GetValueFromBuffer'>} */
module.exports = function (t, year, actual, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	/** @typedef {Exclude<import('../testHelpers').TestYear, 5 | 2015 | 2016>} gte2017 */

	var GetValueFromBuffer = year >= 2024
		? /** @type {import('../testHelpers').AOOnlyYears<'GetValueFromBuffer', 2023>} */ function GetValueFromBuffer(arrayBuffer, byteIndex, type, isTypedArray, order) {
			return /** @type {import('../testHelpers').AOOnlyYears<'GetValueFromBuffer', 2024>} */ (actual)(
				arrayBuffer,
				byteIndex,
				/** @type {Uppercase<import('../../types').TypedArrayTypeByName<import('../../types').TypedArrayName>>} */ (type.toUpperCase()),
				isTypedArray,
				/** @type {'SEQ-CST' | 'UNORDERED'} */ (order.toUpperCase().replace('SEQCST', 'SEQ-CST'))
			);
		}
		: year >= 2017
			? /** @type {import('../testHelpers').AOOnlyYears<'GetValueFromBuffer', Exclude<gte2017, 2024>>} */ (actual)
			: /** @type {import('../testHelpers').AOOnlyYears<'GetValueFromBuffer', Exclude<gte2017, 2024>>} */ function GetValueFromBuffer(arrayBuffer, byteIndex, type, isTypedArray, order) {
				if (arguments.length > 5) {
					return /** @type {import('../testHelpers').AOOnlyYears<'GetValueFromBuffer', Exclude<import('../testHelpers').TestYear, gte2017>>} */ (actual)(
						arrayBuffer,
						byteIndex,
						type,
						arguments[5]
					);
				}
				return /** @type {import('../testHelpers').AOOnlyYears<'GetValueFromBuffer', Exclude<import('../testHelpers').TestYear, gte2017>>} */ (actual)(
					arrayBuffer,
					byteIndex,
					type
				);
			};

	var order = year >= 2024 ? 'UNORDERED' : 'Unordered';

	forEach(esV.unknowns, function (nonAB) {
		t['throws'](
			function () { GetValueFromBuffer(nonAB, 0, year >= 2024 ? 'INT8' : 'Int8', true, order, true); },
			TypeError,
			debug(nonAB) + ' is not an ArrayBuffer'
		);
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
			st['throws'](
				function () { GetValueFromBuffer(new ArrayBuffer(8), nonNonNegativeInteger, year >= 2024 ? 'INT8' : 'Int8', true, order); },
				TypeError,
				debug(nonNonNegativeInteger) + ' is not a valid byte index'
			);
		});

		forEach(esV.invalidTATypes, function (nonString) {
			st['throws'](
				// @ts-expect-error
				function () { GetValueFromBuffer(new ArrayBuffer(8), 0, nonString, true, order); },
				TypeError,
				debug(nonString) + ' is not a valid String value'
			);
		});

		forEach(v.nonBooleans, function (nonBoolean) {
			st['throws'](
				function () { GetValueFromBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', nonBoolean, true, order); },
				TypeError,
				debug(nonBoolean) + ' is not a valid Boolean value'
			);

			if (year >= 2017) {
				st['throws'](
					function () { GetValueFromBuffer(new ArrayBuffer(8), 0, year >= 2024 ? 'INT8' : 'Int8', false, 'Unordered', nonBoolean, true, order); },
					TypeError,
					'isLittleEndian: ' + debug(nonBoolean) + ' is not a valid Boolean value'
				);
			}
		});

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			var buffer = new ArrayBuffer(8);
			s2t.equal(DetachArrayBuffer(buffer), null, 'detaching returns null');

			s2t['throws'](
				function () { GetValueFromBuffer(buffer, 0, year >= 2024 ? 'INT8' : 'Int8', true, order); },
				TypeError,
				'detached buffers throw'
			);

			s2t.end();
		});

		forEach(bufferTestCases, function (testCase, name) {
			st.test(name + ': ' + debug(testCase.value), function (s2t) {
				forEach(esV.numberTypes, function (type) {
					var view = new DataView(new ArrayBuffer(esV.elementSizes.$Float64Array));
					var method = type === 'Uint8C' ? 'Uint8' : type;
					// var value = unserialize(testCase.value);
					var result = testCase[type === 'Uint8C' ? 'Uint8Clamped' : type];
					var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8C'; // the 8-bit types are special, they don't have big-endian
					/*
					st.equal(
						GetValueFromBuffer(testCase.buffer, 0, type),
						defaultEndianness === testCase.endian ? testCase[type + 'little'] : testCase[type + 'big'],
						'buffer holding ' + debug(value) + ' (' + testCase.endian + ' endian) with type ' + type + ', default endian, yields expected value'
					);
					*/

					var actualType = year >= 2024 ? /** @type {Uppercase<typeof type>} */ (type.toUpperCase()) : type;

					clearBuffer(view.buffer);
					var littleVal = unserialize(result.setAsLittle.asLittle);
					view[/** @type {`set${typeof method}`} */ ('set' + method)](0, littleVal, true);

					s2t.equal(
						GetValueFromBuffer(view.buffer, 0, actualType, true, order, true),
						littleVal,
						'buffer with type ' + type + ', little -> little, yields expected value'
					);

					if (hasBigEndian) {
						s2t.equal(
							GetValueFromBuffer(view.buffer, 0, actualType, true, order, false),
							view[/** @type {`get${typeof method}`} */ ('get' + method)](0, false),
							'buffer with type ' + type + ', little -> big, yields expected value'
						);

						clearBuffer(view.buffer);
						var bigVal = unserialize(result.setAsBig.asBig);
						view[/** @type {`set${typeof method}`} */ ('set' + method)](0, bigVal, false);

						s2t.equal(
							GetValueFromBuffer(view.buffer, 0, actualType, true, order, false),
							bigVal,
							'buffer with type ' + type + ', big -> big, yields expected value'
						);

						s2t.equal(
							GetValueFromBuffer(view.buffer, 0, actualType, true, order, true),
							view[/** @type {`get${typeof method}`} */ ('get' + method)](0, true),
							'buffer with type ' + type + ', big -> little, yields expected value'
						);
					}
				});

				s2t.end();
			});
		});

		st.end();
	});
};
