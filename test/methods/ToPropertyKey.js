'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, ToPropertyKey) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(esV.allButSyms, function (value) {
		t.equal(ToPropertyKey(value), String(value), 'ToPropertyKey(value) === String(value) for non-Symbols');
	});

	forEach(v.symbols, function (symbol) {
		t.equal(
			ToPropertyKey(symbol),
			symbol,
			'ToPropertyKey(' + debug(symbol) + ') === ' + debug(symbol)
		);
		t.equal(
			ToPropertyKey(Object(symbol)),
			symbol,
			'ToPropertyKey(' + debug(Object(symbol)) + ') === ' + debug(symbol)
		);
	});
};
