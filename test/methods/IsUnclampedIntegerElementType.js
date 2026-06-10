'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, IsUnclampedIntegerElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.getUnclampedIntegerTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsUnclampedIntegerElementType(typeForYear),
			true,
			debug(typeForYear) + ' is an unclamped integer element type'
		);
	});

	forEach([].concat(
		esV.getClampedTypes(year),
		esV.getNonUnclampedIntegerTypes(year)
	), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsUnclampedIntegerElementType(typeForYear),
			false,
			debug(typeForYear) + ' is not an unclamped integer element type'
		);
	});
};
