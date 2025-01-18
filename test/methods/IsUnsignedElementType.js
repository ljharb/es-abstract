'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsUnsignedElementType'>} */
module.exports = function (t, year, IsUnsignedElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.unsignedElementTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsUnsignedElementType(type),
			true,
			debug(type) + ' is an unsigned element type'
		);
	});

	forEach(esV.signedElementTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsUnsignedElementType(type),
			false,
			debug(type) + ' is not an unsigned element type'
		);
	});
};
