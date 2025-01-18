'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'CheckObjectCoercible'>} */
module.exports = function (t, year, CheckObjectCoercible) {
	t.equal(year, 5, 'CheckObjectCoercible -> RequireObjectCoercible in ES6');

	// @ts-expect-error
	t['throws'](function () { return CheckObjectCoercible(undefined); }, TypeError, 'undefined throws');
	// @ts-expect-error
	t['throws'](function () { return CheckObjectCoercible(null); }, TypeError, 'null throws');

	forEach(/** @type {(typeof v.objects | typeof v.nonNullPrimitives)[number][]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.objects,
		v.nonNullPrimitives
	)), function (value) {
		t.doesNotThrow(function () { return CheckObjectCoercible(value); }, debug(value) + ' does not throw');
	});
};
