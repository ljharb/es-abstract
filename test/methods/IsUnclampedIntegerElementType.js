'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsUnclampedIntegerElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.getUnclampedIntegerTypes(year), function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsUnclampedIntegerElementType(type),
			true,
			debug(type) + ' is an unclamped integer element type'
		);
	});

	forEach([].concat(
		esV.getClampedTypes(year),
		esV.getNonUnclampedIntegerTypes(year)
	), function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsUnclampedIntegerElementType(type),
			false,
			debug(type) + ' is not an unclamped integer element type'
		);
	});
};
