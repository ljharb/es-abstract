'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'UTF16DecodeString'>} */
module.exports = function (t, year, UTF16DecodeString) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { UTF16DecodeString(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	t.deepEqual(UTF16DecodeString('abc'), ['a', 'b', 'c'], 'code units get split');
	t.deepEqual(UTF16DecodeString('a' + esV.poo.whole + 'c'), ['a', esV.poo.whole, 'c'], 'code points get split too');
};
