'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'IsStringPrefix'>} */
module.exports = function (t, year, IsStringPrefix) {
	t.ok(year >= 2018 && year <= 2022, 'ES2018 - ES2022');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { IsStringPrefix(nonString, 'a'); },
			TypeError,
			'first arg: ' + debug(nonString) + ' is not a string'
		);
		t['throws'](
			// @ts-expect-error
			function () { IsStringPrefix('a', nonString); },
			TypeError,
			'second arg: ' + debug(nonString) + ' is not a string'
		);
	});

	forEach(v.strings, function (string) {
		t.equal(IsStringPrefix(string, string), true, debug(string) + ' is a prefix of itself');

		t.equal(IsStringPrefix('', string), true, 'the empty string is a prefix of everything');
	});

	t.equal(IsStringPrefix('abc', 'abcd'), true, '"abc" is a prefix of "abcd"');
	t.equal(IsStringPrefix('abcd', 'abc'), false, '"abcd" is not a prefix of "abc"');

	t.equal(IsStringPrefix('a', 'bc'), false, '"a" is not a prefix of "bc"');
};
