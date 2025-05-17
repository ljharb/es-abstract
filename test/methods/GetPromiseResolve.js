'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, GetPromiseResolve) {
	t.ok(year >= 2021, 'ES2021+');

	forEach([].concat(
		v.nonFunctions,
		v.nonConstructorFunctions
	), function (nonConstructor) {
		t['throws'](
			function () { GetPromiseResolve(nonConstructor); },
			TypeError,
			debug(nonConstructor) + ' is not a constructor'
		);
	});

	forEach(v.nonFunctions, function (nonCallable) {
		var C = function C() {};
		C.resolve = nonCallable;

		t['throws'](
			function () { GetPromiseResolve(C); },
			TypeError,
			'`resolve` method: ' + debug(nonCallable) + ' is not callable'
		);
	});

	t.test('Promises supported', { skip: typeof Promise !== 'function' }, function (st) {
		st.equal(GetPromiseResolve(Promise), Promise.resolve, '`GetPromiseResolve(Promise) === Promise.resolve`');

		st.end();
	});

	var C = function () {};
	var resolve = function () {};
	C.resolve = resolve;
	t.equal(GetPromiseResolve(C), resolve, 'returns a callable `resolve` property');
};
