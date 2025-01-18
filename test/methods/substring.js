'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'substring'>} */
module.exports = function (t, year, substring) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { substring(nonString, 0, 0); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	forEach(esV.notInts, function (nonIntegerNumber) {
		t['throws'](
			// @ts-expect-error
			function () { substring('', nonIntegerNumber); },
			TypeError,
			'inclusiveStart, no end: ' + debug(nonIntegerNumber) + ' is not an integer'
		);

		t['throws'](
			// @ts-expect-error
			function () { substring('', nonIntegerNumber, 0); },
			TypeError,
			'inclusiveStart: ' + debug(nonIntegerNumber) + ' is not an integer'
		);

		t['throws'](
			// @ts-expect-error
			function () { substring('', 0, nonIntegerNumber); },
			TypeError,
			'exclusiveEnd: ' + debug(nonIntegerNumber) + ' is not an integer'
		);
	});

	t.equal(substring('abc', 0), 'abc', 'substring of S from 0 works');
	t.equal(substring('abc', 1), 'bc', 'substring of S from 1 works');
	t.equal(substring('abc', 2), 'c', 'substring of S from 2 works');
	t.equal(substring('abc', 3), '', 'substring of S from 3 works');

	t.equal(substring('abc', 0, 1), 'a', 'substring of S from 0 to 1 works');
	t.equal(substring('abc', 1, 1), '', 'substring of S from 1 to 1 works');
	t.equal(substring('abc', 2, 1), '', 'substring of S from 2 to 1 works');
	t.equal(substring('abc', 3, 1), '', 'substring of S from 3 to 1 works');

	t.equal(substring('abc', 0, 2), 'ab', 'substring of S from 0 to 2 works');
	t.equal(substring('abc', 1, 2), 'b', 'substring of S from 1 to 2 works');
	t.equal(substring('abc', 2, 2), '', 'substring of S from 2 to 2 works');
	t.equal(substring('abc', 3, 2), '', 'substring of S from 3 to 2 works');

	t.equal(substring('abc', 0, 3), 'abc', 'substring of S from 0 to 3 works');
	t.equal(substring('abc', 1, 3), 'bc', 'substring of S from 1 to 3 works');
	t.equal(substring('abc', 2, 3), 'c', 'substring of S from 2 to 3 works');
	t.equal(substring('abc', 3, 3), '', 'substring of S from 3 to 3 works');

	t.equal(substring('abc', 0, 4), 'abc', 'substring of S from 0 to 4 works');
	t.equal(substring('abc', 1, 4), 'bc', 'substring of S from 1 to 4 works');
	t.equal(substring('abc', 2, 4), 'c', 'substring of S from 2 to 4 works');
	t.equal(substring('abc', 3, 4), '', 'substring of S from 3 to 4 works');
};
