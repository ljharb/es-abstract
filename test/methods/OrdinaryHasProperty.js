'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'OrdinaryHasProperty'>} */
module.exports = function (t, year, OrdinaryHasProperty) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { OrdinaryHasProperty(primitive, ''); },
			TypeError,
			debug(primitive) + ' is not an object'
		);
	});
	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			// @ts-expect-error
			function () { OrdinaryHasProperty({}, nonPropertyKey); },
			TypeError,
			'P: ' + debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.equal(OrdinaryHasProperty({ a: 1 }, 'a'), true, 'own property is true');
	t.equal(OrdinaryHasProperty(/** @type {Record<PropertyKey, unknown>} */ ({}), 'toString'), true, 'inherited property is true');
	t.equal(OrdinaryHasProperty(/** @type {Record<PropertyKey, unknown>} */ ({}), 'nope'), false, 'absent property is false');
};
