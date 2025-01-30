'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'GetPromiseResolve'>} */
module.exports = function (t, year, GetPromiseResolve) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(/** @type {unknown[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.nonFunctions,
		v.nonConstructorFunctions
	)), function (nonConstructor) {
		t['throws'](
			// @ts-expect-error
			function () { GetPromiseResolve(nonConstructor); },
			TypeError,
			debug(nonConstructor) + ' is not a constructor'
		);
	});

	/** @constructor */
	function C() {}

	forEach(v.nonFunctions, function (nonCallable) {
		// @ts-expect-error
		C.resolve = nonCallable;

		t['throws'](
			// @ts-expect-error
			function () { GetPromiseResolve(C); },
			TypeError,
			'`resolve` method: ' + debug(nonCallable) + ' is not callable'
		);
	});

	t.test('Promises supported', { skip: typeof Promise !== 'function' }, function (st) {
		st.equal(GetPromiseResolve(Promise), Promise.resolve, '`GetPromiseResolve(Promise) === Promise.resolve`');

		st.end();
	});

	var resolve = function () {};
	C.resolve = resolve;
	t.equal(GetPromiseResolve(C), resolve, 'returns a callable `resolve` property');
};
