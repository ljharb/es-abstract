'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

/** @type {import('../testHelpers').MethodTest<'ToLength'>} */
module.exports = function (t, year, ToLength) {
	t.ok(year >= 2015, 'ES2015+');

	t['throws'](
		function () { return ToLength(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws a TypeError'
	);

	t.equal(3, ToLength(v.coercibleObject), 'coercibleObject coerces to 3');
	t.equal(42, ToLength('42.5'), '"42.5" coerces to 42');
	t.equal(7, ToLength(7.3), '7.3 coerces to 7');

	forEach([-0, -1, -42, -Infinity], function (negative) {
		t.equal(0, ToLength(negative), negative + ' coerces to +0');
	});

	t.equal(MAX_SAFE_INTEGER, ToLength(MAX_SAFE_INTEGER + 1), '2^53 coerces to 2^53 - 1');
	t.equal(MAX_SAFE_INTEGER, ToLength(MAX_SAFE_INTEGER + 3), '2^53 + 2 coerces to 2^53 - 1');
};
