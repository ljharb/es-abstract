'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, IsUnsignedElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.getUnsignedElementTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsUnsignedElementType(typeForYear),
			true,
			debug(typeForYear) + ' is an unsigned element type'
		);
	});

	forEach(esV.getSignedElementTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsUnsignedElementType(typeForYear),
			false,
			debug(typeForYear) + ' is not an unsigned element type'
		);
	});
};
