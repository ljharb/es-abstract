'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'WeakRefDeref'>} */
module.exports = function (t, year, WeakRefDeref) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(esV.unknowns, function (nonWeakRef) {
		t['throws'](
			// @ts-expect-error
			function () { WeakRefDeref(nonWeakRef); },
			TypeError,
			debug(nonWeakRef) + ' is not a WeakRef'
		);
	});

	t.test('WeakRefs', { skip: typeof WeakRef !== 'function' }, function (st) {
		var sentinel = {};
		var weakRef = new WeakRef({ foo: sentinel });

		st.deepEqual(WeakRefDeref(weakRef), { foo: sentinel }, 'weakRef is dereferenced');

		st.end();
	});
};
