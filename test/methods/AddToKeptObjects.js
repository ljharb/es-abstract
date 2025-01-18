'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'AddToKeptObjects'>} */
module.exports = function (t, year, AddToKeptObjects) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			// @ts-expect-error
			function () { AddToKeptObjects(nonObject); },
			debug(nonObject) + ' is not an Object'
		);
	});

	t.equal(AddToKeptObjects({}), undefined, 'returns nothing');
};
