'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var getTypedArrays = require('../helpers/typedArrays');
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

	forEach(getTypedArrays(year), function (TA) {
		t.test(TA, function (st) {
			var ta = new global[TA](0);
			var expected = TA.replace(/(?:lamped)?Array$/, '');
			st.equal(
				TypedArrayElementType(ta),
				specEnum(year, expected.toLowerCase()),
				debug(ta) + ' (which should be a ' + TA + ') has correct element type'
			);

			st.end();
		});
	});
};
