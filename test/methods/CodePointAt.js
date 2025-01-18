'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'CodePointAt'>} */
module.exports = function (t, year, CodePointAt) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { CodePointAt(nonString, 0); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	t['throws'](
		function () { CodePointAt('abc', -1); },
		TypeError,
		'requires an index >= 0'
	);
	t['throws'](
		function () { CodePointAt('abc', 3); },
		TypeError,
		'requires an index < string length'
	);

	t.deepEqual(CodePointAt('abc', 0), {
		'[[CodePoint]]': 'a',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});
	t.deepEqual(CodePointAt('abc', 1), {
		'[[CodePoint]]': 'b',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});
	t.deepEqual(CodePointAt('abc', 2), {
		'[[CodePoint]]': 'c',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});

	var strWithHalfPoo = 'a' + esV.poo.leading + 'c';
	var strWithWholePoo = 'a' + esV.poo.whole + 'd';

	t.deepEqual(CodePointAt(strWithHalfPoo, 0), {
		'[[CodePoint]]': 'a',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});
	t.deepEqual(CodePointAt(strWithHalfPoo, 1), {
		'[[CodePoint]]': esV.poo.leading,
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': true
	});
	t.deepEqual(CodePointAt(strWithHalfPoo, 2), {
		'[[CodePoint]]': 'c',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});

	t.deepEqual(CodePointAt(strWithWholePoo, 0), {
		'[[CodePoint]]': 'a',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});
	t.deepEqual(CodePointAt(strWithWholePoo, 1), {
		'[[CodePoint]]': esV.poo.whole,
		'[[CodeUnitCount]]': 2,
		'[[IsUnpairedSurrogate]]': false
	});
	t.deepEqual(CodePointAt(strWithWholePoo, 2), {
		'[[CodePoint]]': esV.poo.trailing,
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': true
	});
	t.deepEqual(CodePointAt(strWithWholePoo, 3), {
		'[[CodePoint]]': 'd',
		'[[CodeUnitCount]]': 1,
		'[[IsUnpairedSurrogate]]': false
	});
};
