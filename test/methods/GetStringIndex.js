'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'GetStringIndex'>} */
module.exports = function (t, year, GetStringIndex) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.nonStrings, function (notString) {
		t['throws'](
			// @ts-expect-error
			function () { return GetStringIndex(notString); },
			TypeError,
			'`S`: ' + debug(notString) + ' is not a string'
		);
	});

	forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
		t['throws'](
			function () { GetStringIndex('', nonNonNegativeInteger); },
			TypeError,
			'`e`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	var strWithWholePoo = 'a' + esV.poo.whole + 'c';
	t.equal(GetStringIndex(strWithWholePoo, 0), 0, 'index 0 yields 0');
	t.equal(GetStringIndex(strWithWholePoo, 1), 1, 'index 1 yields 1');
	t.equal(GetStringIndex(strWithWholePoo, 2), 3, 'index 2 yields 3');
	t.equal(GetStringIndex(strWithWholePoo, 3), 4, 'index 3 yields 4');

	t.equal(GetStringIndex('', 0), 0, 'index 0 yields 0 on empty string');
	t.equal(GetStringIndex('', 1), 0, 'index 1 yields 0 on empty string');
};
