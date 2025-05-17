'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, UnicodeEscape) {
	t.ok(year >= 2018, 'ES2018+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { UnicodeEscape(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});
	t['throws'](
		function () { UnicodeEscape(''); },
		TypeError,
		'empty string does not have length 1'
	);
	t['throws'](
		function () { UnicodeEscape('ab'); },
		TypeError,
		'2-char string does not have length 1'
	);

	t.equal(UnicodeEscape(' '), '\\u0020');
	t.equal(UnicodeEscape('a'), '\\u0061');
	t.equal(UnicodeEscape(esV.poo.leading), '\\ud83d');
	t.equal(UnicodeEscape(esV.poo.trailing), '\\udca9');
};
