'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'HasOwnProperty'>} */
module.exports = function (t, year, HasOwnProperty) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { HasOwnProperty(primitive, 'key'); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonKey) {
		t['throws'](
			// @ts-expect-error
			function () { HasOwnProperty({}, nonKey); },
			TypeError,
			debug(nonKey) + ' is not a Property Key'
		);
	});

	t.equal(HasOwnProperty({}, 'toString'), false, 'inherited properties are not own');
	t.equal(
		HasOwnProperty({ toString: 1 }, 'toString'),
		true,
		'shadowed inherited own properties are own'
	);
	t.equal(HasOwnProperty({ a: 1 }, 'a'), true, 'own properties are own');
};
