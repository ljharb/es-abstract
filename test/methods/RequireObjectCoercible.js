'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'RequireObjectCoercible'>} */
module.exports = function (t, year, RequireObjectCoercible) {
	t.ok(year >= 2015, 'ES2015+');

	// @ts-expect-error
	t['throws'](function () { return RequireObjectCoercible(undefined); }, TypeError, 'undefined throws');
	// @ts-expect-error
	t['throws'](function () { return RequireObjectCoercible(null); }, TypeError, 'null throws');

	forEach(/** @type {(typeof v.objects | typeof v.nonNullPrimitives)[number][]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.objects,
		v.nonNullPrimitives
	)), function (value) {
		t.doesNotThrow(function () { return RequireObjectCoercible(value); }, debug(value) + ' does not throw');
	});
};
