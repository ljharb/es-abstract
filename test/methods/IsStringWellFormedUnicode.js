'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsStringWellFormedUnicode) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.nonStrings, function (notString) {
		t['throws'](
			function () { return IsStringWellFormedUnicode(notString); },
			TypeError,
			debug(notString) + ' is not a string'
		);
	});

	forEach([].concat(
		v.strings,
		esV.poo.whole
	), function (string) {
		t.equal(IsStringWellFormedUnicode(string), true, debug(string) + ' is well-formed unicode');
	});

	forEach([esV.poo.leading, esV.poo.trailing], function (badString) {
		t.equal(IsStringWellFormedUnicode(badString), false, debug(badString) + ' is not well-formed unicode');
	});
};
