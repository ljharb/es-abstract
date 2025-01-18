'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'CompareArrayElements'>} */
module.exports = function (t, year, CompareArrayElements) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(v.nonFunctions, function (nonFunction) {
		if (typeof nonFunction !== 'undefined') {
			t['throws'](
				// @ts-expect-error
				function () { CompareArrayElements(0, 0, nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a function or undefined'
			);
		}
	});

	// @ts-expect-error
	t.equal(CompareArrayElements(), 0, 'both absent yields 0');
	t.equal(CompareArrayElements(undefined, undefined), 0, 'both undefined yields 0');
	t.equal(CompareArrayElements(undefined, 1), 1, 'x of undefined yields 1');
	t.equal(CompareArrayElements(1, undefined), -1, 'y of undefined yields -1');

	t.equal(CompareArrayElements(+0, +0), 0, '+0 == +0');
	t.equal(CompareArrayElements(+0, -0), 0, '+0 == -0');
	t.equal(CompareArrayElements(-0, +0), 0, '-0 == +0');
	t.equal(CompareArrayElements(1, 1), 0, '1 == 1');
	t.equal(CompareArrayElements(1, 2), -1, '1 < 2');
	t.equal(CompareArrayElements(2, 1), 1, '2 > 1');

	var xSentinel = {};
	var ySentinel = {};
	t.equal(
		CompareArrayElements(xSentinel, ySentinel, /** @type {(this: unknown, x: unknown, y: unknown) => unknown} */ function (x, y) {
			t.equal(this, undefined, 'receiver is undefined');
			t.equal(x, xSentinel, 'sentinel x value received');
			t.equal(y, ySentinel, 'sentinel y value received');

			return { valueOf: function () { return 42; } };
		}),
		42,
		'custom comparator returns number-coerced result'
	);

	t.equal(
		CompareArrayElements(xSentinel, ySentinel, function () { return NaN; }),
		0,
		'custom comparator returning NaN yields 0'
	);
};
