'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'IsNonNegativeInteger'>} */
module.exports = function (t, year, IsNonNegativeInteger) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.notNonNegativeIntegers, function (nonIntegerNumber) {
		t.equal(
			IsNonNegativeInteger(nonIntegerNumber),
			false,
			debug(nonIntegerNumber) + ' is not a non-negative integer'
		);
	});

	forEach(/** @type {number[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.zeroes,
		v.integerNumbers
	)), function (nonNegativeInteger) {
		t.equal(
			IsNonNegativeInteger(nonNegativeInteger),
			true,
			debug(nonNegativeInteger) + ' is a non-negative integer'
		);
	});
};
