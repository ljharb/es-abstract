'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'GetPrototypeFromConstructor'>} */
module.exports = function (t, year, GetPrototypeFromConstructor) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { GetPrototypeFromConstructor(nonFunction, '%Array%'); },
			TypeError,
			debug(nonFunction) + ' is not a constructor'
		);
	});

	forEach(v.arrowFunctions, function (arrowFn) {
		t['throws'](
			// @ts-expect-error
			function () { GetPrototypeFromConstructor(arrowFn, '%Array%'); },
			TypeError,
			debug(arrowFn) + ' is not a constructor'
		);
	});

	t['throws'](
		function () { GetPrototypeFromConstructor(function () {}, '%Number.MAX_VALUE%'); },
		TypeError,
		'a non-object default intrinsic throws'
	);

	/** @construcctor */
	function f() {}
	t.equal(
		GetPrototypeFromConstructor(f, '%Array.prototype%'),
		f.prototype,
		'function with normal `prototype` property returns it'
	);
	forEach([true, 'foo', 42], function (truthyPrimitive) {
		f.prototype = truthyPrimitive;
		t.equal(
			GetPrototypeFromConstructor(f, '%Array.prototype%'),
			Array.prototype,
			'function with non-object `prototype` property (' + debug(truthyPrimitive) + ') returns default intrinsic'
		);
	});
};
