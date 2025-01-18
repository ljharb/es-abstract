'use strict';

var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'Get'>} */
module.exports = function (t, year, Get) {
	t.ok(year >= 2015, 'ES2015+');

	// @ts-expect-error
	t['throws'](function () { return Get('a', 'a'); }, TypeError, 'Throws a TypeError if `O` is not an Object');
	// @ts-expect-error
	t['throws'](function () { return Get({ 7: 7 }, 7); }, TypeError, 'Throws a TypeError if `P` is not a property key');

	var sentinel = {};
	t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
		var sym = Symbol('sym');
		/** @type {Record<symbol, unknown>} */
		var obj = {};
		obj[sym] = sentinel;

		st.equal(Get(obj, sym), sentinel, 'returns property `P` if it exists on object `O`');

		st.end();
	});

	t.equal(Get({ a: sentinel }, 'a'), sentinel, 'returns property `P` if it exists on object `O`');
};
