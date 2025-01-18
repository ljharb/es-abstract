'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsUnclampedIntegerElementType'>} */
module.exports = function (t, year, IsUnclampedIntegerElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.unclampedIntegerTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsUnclampedIntegerElementType(type),
			true,
			debug(type) + ' is an unclamped integer element type'
		);
	});

	forEach(/** @type {(typeof esV.clampedTypes | typeof esV.nonUnclampedIntegerTypes)[number][]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		esV.clampedTypes,
		esV.nonUnclampedIntegerTypes
	)), function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsUnclampedIntegerElementType(type),
			false,
			debug(type) + ' is not an unclamped integer element type'
		);
	});
};
