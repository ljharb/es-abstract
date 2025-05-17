'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var bufferTestCases = require('../bufferTestCases.json');
var clearBuffer = require('../helpers/clearBuffer');
var unserialize = require('../helpers/unserializeNumeric');
var esV = require('../helpers/v');

module.exports = function (t, year, actual, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	var GetValueFromBuffer = year >= 2017 ? actual : function GetValueFromBuffer(arrayBuffer, byteIndex, type) {
		if (arguments.length > 5) {
			return actual(arrayBuffer, byteIndex, type, arguments[5]);
		}
		return actual(arrayBuffer, byteIndex, type);
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

					if (year >= 2024) {
						type = type.toUpperCase(); // eslint-disable-line no-param-reassign
					}

					clearBuffer(view.buffer);
					var littleVal = unserialize(result.setAsLittle.asLittle);
					view['set' + method](0, littleVal, true);

					s2t.equal(
						GetValueFromBuffer(view.buffer, 0, type, true, order, true),
						littleVal,
						'buffer with type ' + type + ', little -> little, yields expected value'
					);

					if (hasBigEndian) {
						s2t.equal(
							GetValueFromBuffer(view.buffer, 0, type, true, order, false),
							view['get' + method](0, false),
							'buffer with type ' + type + ', little -> big, yields expected value'
						);

						clearBuffer(view.buffer);
						var bigVal = unserialize(result.setAsBig.asBig);
						view['set' + method](0, bigVal, false);

						s2t.equal(
							GetValueFromBuffer(view.buffer, 0, type, true, order, false),
							bigVal,
							'buffer with type ' + type + ', big -> big, yields expected value'
						);

						s2t.equal(
							GetValueFromBuffer(view.buffer, 0, type, true, order, true),
							view['get' + method](0, true),
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
