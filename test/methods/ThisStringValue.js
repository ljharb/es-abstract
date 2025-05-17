'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, ThisStringValue) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { ThisStringValue(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	forEach(v.strings, function (string) {
		t.equal(ThisStringValue(string), string, debug(string) + ' is its own ThisStringValue');

		var obj = Object(string);
		t.equal(ThisStringValue(obj), string, debug(obj) + ' is the boxed ThisStringValue');
	});
};
