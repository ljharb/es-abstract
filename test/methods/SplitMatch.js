'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, SplitMatch) {
	t.ok(year >= 2015 && year <= 2021, 'ES2015 - ES2021');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { SplitMatch(nonString, 0, ''); },
			TypeError,
			'S: ' + debug(nonString) + ' is not a String'
		);
		t['throws'](
			function () { SplitMatch('', 0, nonString); },
			TypeError,
			'R: ' + debug(nonString) + ' is not a String'
		);
	});

	forEach(esV.notInts, function (nonInteger) {
		t['throws'](
			function () { SplitMatch('', nonInteger, ''); },
			TypeError,
			'q: ' + debug(nonInteger) + ' is not an integer'
		);
	});

	var expected = year < 2021 ? false : 'not-matched';
	t.equal(SplitMatch('abc', 0, 'a'), 1, '"a" is found at index 0, before index 1, in "abc"');
	t.equal(SplitMatch('abc', 1, 'a'), expected, '"a" is not found at index 1 in "abc"');
	t.equal(SplitMatch('abc', 2, 'a'), expected, '"a" is not found at index 2 in "abc"');

	t.equal(SplitMatch('abc', 0, 'b'), expected, '"a" is not found at index 0 in "abc"');
	t.equal(SplitMatch('abc', 1, 'b'), 2, '"b" is found at index 1, before index 2, in "abc"');
	t.equal(SplitMatch('abc', 2, 'b'), expected, '"a" is not found at index 2 in "abc"');

	t.equal(SplitMatch('abc', 0, 'c'), expected, '"a" is not found at index 0 in "abc"');
	t.equal(SplitMatch('abc', 1, 'c'), expected, '"a" is not found at index 1 in "abc"');
	t.equal(SplitMatch('abc', 2, 'c'), 3, '"c" is found at index 2, before index 3, in "abc"');

	t.equal(SplitMatch('a', 0, 'ab'), expected, 'R longer than S yields ' + expected);

	var s = 'a' + esV.poo.whole + 'c';
	t.equal(SplitMatch(s, 1, esV.poo.whole), 3, debug(esV.poo.whole) + ' is found at index 1, before index 3, in ' + debug(s));
};
