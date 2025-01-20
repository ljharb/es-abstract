'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsArray) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(true, IsArray([]), '[] is an array');
	t.equal(false, IsArray({}), '{} is not an array');
	t.equal(false, IsArray({ length: 1, 0: true }), 'arraylike object is not an array');

	forEach(esV.unknowns, function (value) {
		t.equal(false, IsArray(value), debug(value) + ' is not an array');
	});
};
