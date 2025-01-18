'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'StringToCodePoints'>} */
module.exports = function (t, year, StringToCodePoints) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { StringToCodePoints(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	t.deepEqual(StringToCodePoints('abc'), ['a', 'b', 'c'], 'code units get split');
	t.deepEqual(StringToCodePoints('a' + esV.poo.whole + 'c'), ['a', esV.poo.whole, 'c'], 'code points get split too');
};
