'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, TypedArrayElementType) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			function () { TypedArrayElementType(nonTA); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	forEach(availableTypedArrays, function (TA) {
		t.test(TA, function (st) {
			var ta = new global[TA](0);
			var expected = TA.replace(/(?:lamped)?Array$/, '');
			st.equal(
				TypedArrayElementType(ta),
				year >= 2024 ? expected.toUpperCase() : expected,
				debug(ta) + ' (which should be a ' + TA + ') has correct element type'
			);

			st.end();
		});
	});
};
