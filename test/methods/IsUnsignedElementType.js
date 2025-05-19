'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsUnsignedElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.getUnsignedElementTypes(year), function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsUnsignedElementType(type),
			true,
			debug(type) + ' is an unsigned element type'
		);
	});

	forEach(esV.getSignedElementTypes(year), function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsUnsignedElementType(type),
			false,
			debug(type) + ' is not an unsigned element type'
		);
	});
};
