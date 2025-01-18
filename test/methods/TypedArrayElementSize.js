'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'TypedArrayElementSize'>} */
module.exports = function (t, year, TypedArrayElementSize) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			// @ts-expect-error
			function () { TypedArrayElementSize(nonTA); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	forEach(getTypedArrays(year), function (TA) {
		var elementSize = esV.elementSizes[/** @type {`$${typeof TA}`} */ ('$' + TA)];

		var ta = new global[TA](0);

		t.equal(
			elementSize,
			ta.BYTES_PER_ELEMENT,
			'element size table matches BYTES_PER_ELEMENT property',
			{ skip: !('BYTES_PER_ELEMENT' in ta) }
		);

		t.equal(TypedArrayElementSize(ta), elementSize, debug(TA) + ' (which should be a ' + TA + ') has correct element size');
	});
};
