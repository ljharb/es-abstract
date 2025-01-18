'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'MakeFullYear'>} */
module.exports = function (t, year, MakeFullYear) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { MakeFullYear(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);

	});

	t.equal(MakeFullYear(NaN), NaN, 'NaN returns NaN');
	t.equal(MakeFullYear(Infinity), Infinity, '∞ returns ∞');
	t.equal(MakeFullYear(-Infinity), -Infinity, '-∞ returns -∞');

	t.equal(MakeFullYear(0), 1900, '0 returns 1900');
	t.equal(MakeFullYear(99), 1999, '99 returns 1999');

	t.equal(MakeFullYear(100), 100, '100 returns 100');
};
