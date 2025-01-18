'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'HasProperty'>} */
module.exports = function (t, year, HasProperty) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { HasProperty(primitive, 'key'); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonKey) {
		t['throws'](
			// @ts-expect-error
			function () { HasProperty({}, nonKey); },
			TypeError,
			debug(nonKey) + ' is not a Property Key'
		);
	});

	t.equal(HasProperty({}, 'nope'), false, 'object does not have nonexistent properties');
	t.equal(HasProperty({}, 'toString'), true, 'object has inherited properties');
	t.equal(
		HasProperty({ toString: 1 }, 'toString'),
		true,
		'object has shadowed inherited own properties'
	);
	t.equal(HasProperty({ a: 1 }, 'a'), true, 'object has own properties');
};
