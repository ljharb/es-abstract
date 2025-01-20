'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, SameValueNonNumber) {
	t.ok(year >= 2015, 'ES2015+');

	var willThrow = [
		[3, 4],
		[NaN, 4],
		[4, ''],
		['abc', true],
		[{}, false]
	];
	forEach(willThrow, function (nums) {
		t['throws'](
			function () { return SameValueNonNumber.apply(null, nums); },
			TypeError,
			'value must be same type and non-number: got ' + debug(nums[0]) + ' and ' + debug(nums[1])
		);
	});

	forEach([].concat(
		v.objects,
		v.nonNumberPrimitives,
		year >= 2020 ? v.bigints : []
	), function (val) {
		t.equal(val === val, SameValueNonNumber(val, val), debug(val) + ' is SameValueNonNumber to itself');
	});
};
