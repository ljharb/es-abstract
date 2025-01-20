'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, LengthOfArrayLike) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { LengthOfArrayLike(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t.equal(LengthOfArrayLike([]), 0);
	t.equal(LengthOfArrayLike([1]), 1);
	t.equal(LengthOfArrayLike({ length: 42 }), 42);
};
