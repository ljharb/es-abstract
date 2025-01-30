'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'IteratorComplete'>} */
module.exports = function (t, year, IteratorComplete) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			// @ts-expect-error
			function () { IteratorComplete(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an Object'
		);
	});

	forEach(v.truthies, function (truthy) {
		// @ts-expect-error
		t.equal(IteratorComplete({ done: truthy }), true, '{ done: ' + debug(truthy) + ' } is true');
	});

	forEach(v.falsies, function (falsy) {
		// @ts-expect-error
		t.equal(IteratorComplete({ done: falsy }), false, '{ done: ' + debug(falsy) + ' } is false');
	});
};
