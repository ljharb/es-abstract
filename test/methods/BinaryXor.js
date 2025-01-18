'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'BinaryAnd'>} */
module.exports = function (t, year, BinaryXor) {
	t.ok(year >= 2020, 'ES2020+');

	t.equal(BinaryXor(0, 0), 0);
	t.equal(BinaryXor(0, 1), 1);
	t.equal(BinaryXor(1, 0), 1);
	t.equal(BinaryXor(1, 1), 0);

	forEach(/** @type {(typeof v.nonIntegerNumbers | typeof v.nonNumberPrimitives | typeof v.objects)[number][]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.nonIntegerNumbers,
		v.nonNumberPrimitives,
		v.objects
	)), function (nonBit) {
		t['throws'](
			// @ts-expect-error
			function () { BinaryXor(0, nonBit); },
			TypeError
		);
		t['throws'](
			// @ts-expect-error
			function () { BinaryXor(nonBit, 1); },
			TypeError
		);
	});
};
