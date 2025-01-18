'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var typedArrayLength = require('typed-array-length');
var v = require('es-value-fixtures');
var whichTypedArray = require('which-typed-array');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'TypedArrayCreateSameType'>} */
module.exports = function (t, year, TypedArrayCreateSameType) {
	t.ok(year >= 2023, 'ES2023+');

	var availableTypedArrays = getTypedArrays(year);

	t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
		forEach(esV.unknowns, function (nonTA) {
			st['throws'](
				// @ts-expect-error
				function () { TypedArrayCreateSameType(nonTA, []); },
				SyntaxError,
				'no Typed Array support'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			st['throws'](
				// @ts-expect-error
				function () { TypedArrayCreateSameType(Array, nonArray); },
				SyntaxError,
				'no Typed Array support'
			);
		});

		st.end();
	});

	t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(esV.unknowns, function (nonTA) {
			st['throws'](
				// @ts-expect-error
				function () { TypedArrayCreateSameType(nonTA, []); },
				TypeError,
				debug(nonTA) + ' is not a Typed Array'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			st['throws'](
				// @ts-expect-error
				function () { TypedArrayCreateSameType(new global[availableTypedArrays[0]](), nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		forEach(availableTypedArrays, function (TypedArray) {
			var Constructor = global[TypedArray];

			var typedArray = TypedArrayCreateSameType(new Constructor(), []);
			st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
			st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

			var taLength = TypedArrayCreateSameType(new Constructor(1), [42]);
			st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
			st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');
		});

		st.end();
	});
};
