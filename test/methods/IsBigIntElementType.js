'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsBigIntElementType'>} */
module.exports = function (t, year, IsBigIntElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.bigIntTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsBigIntElementType(type),
			true,
			debug(type) + ' is a BigInt element type'
		);
	});

	forEach(esV.numberTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsBigIntElementType(type),
			false,
			debug(type) + ' is not a BigInt element type'
		);
	});
};
