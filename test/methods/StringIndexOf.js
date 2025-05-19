'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'StringIndexOf'>} */
module.exports = function (t, year, StringIndexOf) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { StringIndexOf(nonString); },
			TypeError,
			'`string` arg: ' + debug(nonString) + ' is not a String'
		);

		t['throws'](
			// @ts-expect-error
			function () { StringIndexOf('', nonString); },
			TypeError,
			'`searchValue` arg: ' + debug(nonString) + ' is not a String'
		);
	});

	forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
		t['throws'](
			function () { StringIndexOf('', '', notNonNegativeInteger); },
			TypeError,
			'`fromIndex` arg: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	var str = 'abc' + esV.poo.whole + 'abc';
	t.equal(StringIndexOf(str, 'a', 0), 0, 'a: first index found');
	t.equal(StringIndexOf(str, 'a', 1), 5, 'a: second index found');
	t.equal(StringIndexOf(str, 'a', 6), -1, 'a: second index not found');

	t.equal(StringIndexOf(str, 'b', 0), 1, 'b: first index found');
	t.equal(StringIndexOf(str, 'b', 2), 6, 'b: second index found');
	t.equal(StringIndexOf(str, 'b', 7), -1, 'b: second index not found');

	t.equal(StringIndexOf(str, 'c', 0), 2, 'c: first index found');
	t.equal(StringIndexOf(str, 'c', 3), 7, 'c: second index found');
	t.equal(StringIndexOf(str, 'c', 8), -1, 'c: second index not found');

	t.equal(StringIndexOf(str, esV.poo.leading, 0), 3, 'first half of ' + esV.poo.whole + ' found');
	t.equal(StringIndexOf(str, esV.poo.leading, 4), -1, 'first half of ' + esV.poo.whole + ' not found');
	t.equal(StringIndexOf(str, esV.poo.trailing, 0), 4, 'second half of ' + esV.poo.whole + ' found');
	t.equal(StringIndexOf(str, esV.poo.trailing, 5), -1, 'second half of ' + esV.poo.whole + ' not found');
	t.equal(StringIndexOf(str, esV.poo.whole, 0), 3, esV.poo.whole + ' found');
	t.equal(StringIndexOf(str, esV.poo.whole, 4), -1, esV.poo.whole + ' not found');

	t.equal(StringIndexOf('', 'a', 0), -1, 'empty string contains nothing');
	for (var i = 0; i < str.length; i += 1) {
		t.equal(StringIndexOf(str, '', i), i, 'empty string is found at every index: ' + i);
	}
};
