'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsBigIntElementType) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.bigIntTypes, function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsBigIntElementType(type),
			true,
			debug(type) + ' is a BigInt element type'
		);
	});

	forEach(esV.numberTypes, function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsBigIntElementType(type),
			false,
			debug(type) + ' is not a BigInt element type'
		);
	});
};
