'use strict';

var v = require('es-value-fixtures');
var MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

module.exports = function (t, year, ToIndex) {
	t.ok(year >= 2017, 'ES2017+');

	t.equal(ToIndex(), 0, 'no value gives +0');
	t.equal(ToIndex(undefined), 0, 'undefined value gives +0');
	t.equal(ToIndex(-0), 0, '-0 gives +0');

	t['throws'](function () { ToIndex(-1); }, RangeError, 'negative numbers throw');

	t['throws'](function () { ToIndex(MAX_SAFE_INTEGER + 1); }, RangeError, 'too large numbers throw');

	t.equal(ToIndex(3), 3, 'numbers work');
	t.equal(ToIndex(v.valueOfOnlyObject), 4, 'coercible objects are coerced');
};
