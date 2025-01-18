'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'TypedArrayGetElement'>} */
module.exports = function (t, year, TypedArrayGetElement) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			// @ts-expect-error
			function () { TypedArrayGetElement(nonTA, 0); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		var ta = new Uint8Array();

		forEach(v.nonNumbers, function (nonNumber) {
			st['throws'](
				// @ts-expect-error
				function () { TypedArrayGetElement(ta, nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a number'
			);
		});

		forEach(availableTypedArrays, function (TypedArray) {
			var Z = esV.isBigIntTAType(TypedArray) ? BigInt : Number;
			var TA = global[TypedArray];

			var arr = new TA([Z(1), Z(2), Z(3)]);

			st.equal(TypedArrayGetElement(arr, 0), Z(1), 'index 0 is as expected');
			st.equal(TypedArrayGetElement(arr, 1), Z(2), 'index 1 is as expected');
			st.equal(TypedArrayGetElement(arr, 2), Z(3), 'index 2 is as expected');
			st.equal(TypedArrayGetElement(arr, 3), undefined, 'index 3 is undefined as expected');
		});

		st.end();
	});
};
