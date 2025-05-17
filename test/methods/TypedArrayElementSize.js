'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, TypedArrayElementSize) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			function () { TypedArrayElementSize(nonTA); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	forEach(availableTypedArrays, function (TA) {
		var elementSize = esV.elementSizes['$' + TA];

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
