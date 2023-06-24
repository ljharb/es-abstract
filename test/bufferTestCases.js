'use strict';

var test = require('tape');

var arrayFrom = require('array.from');
var availableTypedArrays = require('available-typed-arrays')();
var forEach = require('for-each');
var hasBigInts = require('has-bigints')();

var $BigInt = hasBigInts ? BigInt : null;

var ToUint8Clamp = require('../2017/ToUint8Clamp');

var bufferTestCases = require('./bufferTestCases.json');
var unserialize = require('./helpers/unserializeNumeric');

var elementSizes = {
	__proto__: null,
	$Int8Array: 1,
	$Uint8Array: 1,
	$Uint8ClampedArray: 1,
	$Int16Array: 2,
	$Uint16Array: 2,
	$Int32Array: 4,
	$Uint32Array: 4,
	$BigInt64Array: 8,
	$BigUint64Array: 8,
	$Float32Array: 4,
	$Float64Array: 8
};

test('buffer test cases: sanity check', { skip: availableTypedArrays.length === 0 }, function (t) {
	forEach(bufferTestCases, function (testCase, name) {
		var value = unserialize(testCase.value);

		t.test(name + ': ' + value, function (st) {
			forEach([].concat(
				'Int8',
				'Uint8',
				'Uint8Clamped',
				'Int16',
				'Uint16',
				'Int32',
				'Uint32',
				hasBigInts ? [
					'BigInt64',
					'BigUint64'
				] : [],
				'Float32',
				'Float64'
			), function (type) {
				var elementSize = elementSizes['$' + type + 'Array'];

				var typeTest = testCase[type];

				var view = new DataView(new ArrayBuffer(elementSizes.$Float64Array));
				var method = type === 'Uint8Clamped' ? 'Uint8' : type;
				var valToSet = type === 'Uint8Clamped' ? ToUint8Clamp(value) : value;
				var hasBigEndian = type !== 'Int8' && type !== 'Uint8' && type !== 'Uint8Clamped'; // the 8-bit types are special, they don't have big-endian
				var isBigInt = type.slice(0, 3) === 'Big';

				st.test(
					type,
					{ skip: isBigInt && (!isFinite(value) || Math.floor(value) !== value) && '(BigInt types do not support non-integer values)' },
					function (s2t) {
						if (
							!hasBigEndian && (
								'setAsBig' in typeTest
								|| 'asBig' in typeTest.setAsLittle
								|| 'truncatedBig' in typeTest.setAsLittle
							)
						) {
							s2t.fail('should not have big-endian test cases');
							s2t.end();
							return;
						}

						s2t.test('set as little', function (s3t) {
							var results = typeTest.setAsLittle;
							view.setFloat64(0, 0, true); // clear the buffer

							view.setFloat64(0, valToSet, true);
							s3t.deepEqual(
								arrayFrom(results.bytes),
								arrayFrom(Array.prototype.slice.call(new Uint8Array(view.buffer), 0, elementSize)),
								'has correct expected bytes'
							);
							s3t.equal(
								unserialize(results.asLittle),
								view['get' + method](0, true),
								'get as little: has correct expected value'
							);

							s3t.equal(
								unserialize(results.asBig),
								view['get' + method](0, false),
								'get as big: has correct expected value',
								{ skip: hasBigEndian ? false : '(' + type + ' only has little-endian)' }
							);

							s3t.end();
						});

						s2t.test('set as truncated little', function (s3t) {
							var results = typeTest.setAsTruncatedLittle;
							view.setFloat64(0, 0, true); // clear the buffer

							view['set' + method](0, isBigInt ? $BigInt(valToSet) : valToSet, true);

							s3t.deepEqual(
								arrayFrom(results.bytes),
								arrayFrom(Array.prototype.slice.call(new Uint8Array(view.buffer), 0, elementSize)),
								'has correct expected bytes'
							);
							s3t.equal(
								unserialize(results.asLittle),
								view['get' + method](0, true),
								'get as little: has correct expected value'
							);

							s3t.equal(
								unserialize(results.asBig),
								view['get' + method](0, false),
								'get as big: has correct expected value',
								{ skip: hasBigEndian ? false : '(' + type + ' only has little-endian)' }
							);

							s3t.end();
						});

						s2t.test('set as big', { skip: hasBigEndian ? false : '(' + type + ' only has little-endian)' }, function (s3t) {
							var results = typeTest.setAsBig;
							view.setFloat64(0, 0, true); // clear the buffer

							view.setFloat64(0, valToSet, false);

							s3t.deepEqual(
								arrayFrom(results.bytes),
								arrayFrom(Array.prototype.slice.call(new Uint8Array(view.buffer), 0, elementSize)),
								'has correct expected bytes'
							);
							s3t.equal(
								unserialize(results.asLittle),
								view['get' + method](0, true),
								'get as little: has correct expected value'
							);
							s3t.equal(
								unserialize(results.asBig),
								view['get' + method](0, false),
								'get as big: has correct expected value'
							);

							s3t.end();
						});

						s2t.test('set as truncated big', { skip: hasBigEndian ? false : '(' + type + ' only has little-endian)' }, function (s3t) {
							var results = typeTest.setAsTruncatedBig;
							view.setFloat64(0, 0, true); // clear the buffer

							view['set' + method](0, isBigInt ? $BigInt(valToSet) : valToSet, false);

							s3t.deepEqual(
								arrayFrom(results.bytes),
								arrayFrom(Array.prototype.slice.call(new Uint8Array(view.buffer), 0, elementSize)),
								'has correct expected bytes'
							);
							s3t.equal(
								unserialize(results.asLittle),
								view['get' + method](0, true),
								'get as little: has correct expected value'
							);
							s3t.equal(
								unserialize(results.asBig),
								view['get' + method](0, false),
								'get as big: has correct expected value'
							);

							s3t.end();
						});

						s2t.end();
					}
				);
			});

			st.end();
		});
	});

	t.end();
});
