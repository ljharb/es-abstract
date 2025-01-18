'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'IteratorValue'>} */
module.exports = function (t, year, IteratorValue) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			// @ts-expect-error
			function () { IteratorValue(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an Object'
		);
	});

	var sentinel = {};
	t.equal(IteratorValue({ value: sentinel }), sentinel, 'Gets `.value` off the object');
};
