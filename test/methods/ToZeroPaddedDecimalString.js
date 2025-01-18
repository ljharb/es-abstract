'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ToZeroPaddedDecimalString'>} */
module.exports = function (t, year, ToZeroPaddedDecimalString) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
		t['throws'](
			// @ts-expect-error
			function () { ToZeroPaddedDecimalString(notNonNegativeInteger); },
			RangeError,
			debug(notNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	t.equal(ToZeroPaddedDecimalString(1, 1), '1');
	t.equal(ToZeroPaddedDecimalString(1, 2), '01');
	t.equal(ToZeroPaddedDecimalString(1, 3), '001');
};
