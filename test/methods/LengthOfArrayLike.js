'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'LengthOfArrayLike'>} */
module.exports = function (t, year, LengthOfArrayLike) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { LengthOfArrayLike(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t.equal(LengthOfArrayLike([]), 0);
	t.equal(LengthOfArrayLike([1]), 1);
	t.equal(LengthOfArrayLike({ length: 42 }), 42);
};
