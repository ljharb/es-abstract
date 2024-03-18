'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, StringLastIndexOf) {
	t.ok(year >= 2025, 'ES2025+');

	var notFound = 'NOT-FOUND';

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { StringLastIndexOf(nonString, '', 0); },
			TypeError,
			'`string` arg: ' + debug(nonString) + ' is not a String'
		);

		t['throws'](
			function () { StringLastIndexOf('', nonString, 0); },
			TypeError,
			'`searchValue` arg: ' + debug(nonString) + ' is not a String'
		);
	});

	forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
		t['throws'](
			function () { StringLastIndexOf('', '', notNonNegativeInteger); },
			TypeError,
			'`fromIndex` arg: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	var str = 'abc' + esV.poo.whole + 'abc';
	t.equal(StringLastIndexOf(str, 'a', str.length - 1), 5, 'a: second index found from end');
	t.equal(StringLastIndexOf(str, 'a', 1), 0, 'a: first index found from 1');
	t.equal(StringLastIndexOf(str, 'a', 0), 0, 'a: first index found from 0');

	t.equal(StringLastIndexOf(str, 'b', str.length - 1), 6, 'b: second index found from end');
	t.equal(StringLastIndexOf(str, 'b', 2), 1, 'b: first index found from 2');
	t.equal(StringLastIndexOf(str, 'b', 0), notFound, 'b: second index not found from 0');

	t.equal(StringLastIndexOf(str, 'c', str.length - 1), 7, 'c: first index found from end');
	t.equal(StringLastIndexOf(str, 'c', 3), 2, 'c: second index found from 3');
	t.equal(StringLastIndexOf(str, 'c', 0), notFound, 'c: second index not found from 0');

	t.equal(StringLastIndexOf(str, esV.poo.trailing, str.length - 1), 4, 'second half of ' + esV.poo.whole + ' found from end');
	t.equal(StringLastIndexOf(str, esV.poo.trailing, 3), notFound, 'second half of ' + esV.poo.whole + ' not found from 3');

	t.equal(StringLastIndexOf(str, esV.poo.leading, 4), 3, 'first half of ' + esV.poo.whole + ' found from 4');
	t.equal(StringLastIndexOf(str, esV.poo.leading, 0), notFound, 'first half of ' + esV.poo.whole + ' not found from 0');

	t.equal(StringLastIndexOf(str, esV.poo.whole, str.length - esV.poo.whole.length), 3, esV.poo.whole + ' found from ~end');
	t.equal(StringLastIndexOf(str, esV.poo.whole, 2), notFound, esV.poo.whole + ' not found from 2');

	t['throws'](
		function () { StringLastIndexOf('', 'a', 0); },
		TypeError,
		'empty string can not be searched'
	);
	for (var i = str.length; i >= 0; i -= 1) {
		t.equal(StringLastIndexOf(str, '', i), i, 'empty string is found at every index: ' + i);
	}
};
