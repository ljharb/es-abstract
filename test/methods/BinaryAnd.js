'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'BinaryAnd'>} */
module.exports = function (t, year, BinaryAnd) {
	t.ok(year >= 2020, 'ES2020+');

	t.equal(BinaryAnd(0, 0), 0);
	t.equal(BinaryAnd(0, 1), 0);
	t.equal(BinaryAnd(1, 0), 0);
	t.equal(BinaryAnd(1, 1), 1);

	forEach(/** @type {(typeof v.nonIntegerNumbers | typeof v.nonNumberPrimitives | typeof v.objects)[number][]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.nonIntegerNumbers,
		v.nonNumberPrimitives,
		v.objects
	)), function (nonBit) {
		t['throws'](
			// @ts-expect-error
			function () { BinaryAnd(0, nonBit); },
			TypeError
		);
		t['throws'](
			// @ts-expect-error
			function () { BinaryAnd(nonBit, 1); },
			TypeError
		);
	});
};
