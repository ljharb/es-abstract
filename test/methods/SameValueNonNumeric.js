'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var flatMap = require('array.prototype.flatmap');

/** @type {import('../testHelpers').MethodTest<'SameValueNonNumeric'>} */
module.exports = function (t, year, SameValueNonNumeric) {
	t.ok(year >= 2020 && year <= 2022, 'ES2020 - ES2022');

	var willThrow = /** @type {const} */ ([
		[3, 4],
		[NaN, 4],
		[4, ''],
		['abc', true],
		[{}, false]
	]).concat(flatMap(v.bigints, function (bigint) {
		return /** @type {const} */ ([
			[bigint, bigint],
			[bigint, {}],
			[{}, bigint],
			[3, bigint],
			[bigint, 3],
			['', bigint],
			[bigint, '']
		]);
	}));
	forEach(willThrow, function (nums) {
		t['throws'](
			function () { return SameValueNonNumeric.apply(null, nums); },
			TypeError,
			'value must be same type and non-number/bigint: got ' + debug(nums[0]) + ' and ' + debug(nums[1])
		);
	});

	forEach(/** @type {(typeof v.objects | typeof v.nonNumberPrimitives)[number][]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.objects,
		v.nonNumberPrimitives
	)), function (val) {
		t.equal(
			SameValueNonNumeric(val, val),
			val === val,
			debug(val) + ' is SameValueNonNumeric to itself'
		);
	});
};
