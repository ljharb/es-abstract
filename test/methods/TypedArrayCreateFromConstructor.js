'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var typedArrayLength = require('typed-array-length');
var v = require('es-value-fixtures');
var whichTypedArray = require('which-typed-array');

var getTypedArrays = require('../helpers/typedArrays');

/** @type {import('../testHelpers').MethodTest<'TypedArrayCreateFromConstructor'>} */
module.exports = function (t, year, TypedArrayCreateFromConstructor) {
	t.ok(year >= 2016, 'ES2016+');

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { TypedArrayCreateFromConstructor(nonFunction, []); },
			TypeError,
			debug(nonFunction) + ' is not a constructor'
		);
	});

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { TypedArrayCreateFromConstructor(Array, nonArray); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
		st['throws'](
			function () { TypedArrayCreateFromConstructor(Array, []); },
			SyntaxError,
			'no Typed Array support'
		);

		st.end();
	});

	t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
		var expectedLengths = {
			__proto__: null,
			$Int8Array: 632,
			$Uint8Array: 632,
			$Uint8ClampedArray: 632,
			$Int16Array: 316,
			$Uint16Array: 316,
			$Int32Array: 158,
			$Uint32Array: 158,
			$Float16Array: 316,
			$Float32Array: 158,
			$Float64Array: 79,
			$BigInt64Array: 79,
			$BigUint64Array: 79
		};
		forEach(availableTypedArrays, function (TypedArray) {
			var Constructor = global[TypedArray];

			var typedArray = TypedArrayCreateFromConstructor(Constructor, []);
			st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
			st.equal(typedArray.byteOffset, 0, 'byteOffset is 0');
			st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

			var taLength = TypedArrayCreateFromConstructor(Constructor, [42]);
			st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
			st.equal(taLength.byteOffset, 0, 'byteOffset is 0');
			st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');

			var buffer = new ArrayBuffer(640);

			var taBuffer = TypedArrayCreateFromConstructor(Constructor, [buffer, 8]);
			st.equal(whichTypedArray(taBuffer), TypedArray, 'created a ' + TypedArray);
			st.equal(taBuffer.byteOffset, 8, 'byteOffset is 8');
			st.equal(
				typedArrayLength(taBuffer),
				expectedLengths[/** @type {`$${typeof TypedArray}`} */ ('$' + TypedArray)],
				'created a ' + TypedArray + ' of length ' + expectedLengths[/** @type {`$${typeof TypedArray}`} */ ('$' + TypedArray)]
			);

			var taBufferLength = TypedArrayCreateFromConstructor(Constructor, [buffer, 8, 64]);
			st.equal(whichTypedArray(taBufferLength), TypedArray, 'created a ' + TypedArray);
			st.equal(taBufferLength.byteOffset, 8, 'byteOffset is 8');
			st.equal(typedArrayLength(taBufferLength), 64, 'created a ' + TypedArray + ' of length 64');
		});

		st.end();
	});
};
