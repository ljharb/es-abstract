'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, IsPropertyKey) {
	t.ok(year >= 2015, 'ES2015+');

	forEach([].concat(
		v.numbers,
		v.objects
	), function (notKey) {
		t.equal(IsPropertyKey(notKey), false, debug(notKey) + ' is not property key');
	});

	t.equal(IsPropertyKey('foo'), true, 'string is property key');

	forEach(v.symbols, function (symbol) {
		t.equal(IsPropertyKey(symbol), true, debug(symbol) + ' is property key');
	});
};
