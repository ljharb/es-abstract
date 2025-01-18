'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var safeBigInt = require('safe-bigint');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

var twoSixtyFour = safeBigInt && safeBigInt(Math.pow(2, 64));

/** @type {import('../testHelpers').MethodTest<'CompareTypedArrayElements'>} */
module.exports = function (t, year, CompareTypedArrayElements) {
	t.ok(year >= 2023, 'ES2023+');

	t['throws'](
		// @ts-expect-error
		function () { CompareTypedArrayElements(); },
		TypeError,
		'no arguments throws a TypeError'
	);
	t['throws'](
		// @ts-expect-error
		function () { CompareTypedArrayElements(1, 'a'); },
		TypeError,
		'one String argument throws a TypeError'
	);
	if (esV.hasBigInts) {
		t['throws'](
			// @ts-expect-error
			function () { CompareTypedArrayElements(1, twoSixtyFour); },
			TypeError,
			'one Number and other BigInt argument throws a TypeError'
		);
	}

	forEach(v.nonFunctions, function (nonFunction) {
		if (typeof nonFunction !== 'undefined') {
			t['throws'](
				// @ts-expect-error
				function () { CompareTypedArrayElements(0, 0, nonFunction); },
				TypeError,
				debug(nonFunction) + ' is not a function or undefined'
			);
		}
	});

	t.equal(CompareTypedArrayElements(1, 1, undefined), 0, '1 == 1');
	t.equal(CompareTypedArrayElements(0, 1, undefined), -1, '0 < 1');
	t.equal(CompareTypedArrayElements(1, 0, undefined), 1, '1 > 0');

	t.equal(CompareTypedArrayElements(NaN, NaN, undefined), 0, 'NaN == NaN');
	t.equal(CompareTypedArrayElements(NaN, 0, undefined), 1, 'NaN > 0');
	t.equal(CompareTypedArrayElements(0, NaN, undefined), -1, '0 > NaN');

	t.equal(CompareTypedArrayElements(0, -0, undefined), 1, '0 > -0');
	t.equal(CompareTypedArrayElements(-0, 0, undefined), -1, '-0 < 0');
	t.equal(CompareTypedArrayElements(-0, -0, undefined), 0, '-0 == -0');

	var compareFn = /** @type {(this: unknown, x: number, y: number) => number} */ function compareFn(x, y) {
		t.equal(this, undefined, 'receiver is undefined');
		t.equal(x, 0, 'sentinel x value received');
		t.equal(y, 1, 'sentinel y value received');

		return -Infinity;
	};
	t.equal(CompareTypedArrayElements(0, 1, compareFn), -Infinity, 'comparefn return is passed through');

	t.equal(CompareTypedArrayElements(0, 1, function () { return NaN; }), 0, 'comparefn returning NaN yields +0');
};
