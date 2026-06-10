'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, IsBigIntElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.getBigIntTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsBigIntElementType(typeForYear),
			true,
			debug(typeForYear) + ' is a BigInt element type'
		);
	});

	forEach(esV.getNumberTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsBigIntElementType(typeForYear),
			false,
			debug(typeForYear) + ' is not a BigInt element type'
		);
	});
};
