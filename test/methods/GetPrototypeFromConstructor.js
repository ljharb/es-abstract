'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var arrowFns = require('make-arrow-function').list();

module.exports = function (t, year, GetPrototypeFromConstructor) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { GetPrototypeFromConstructor(nonFunction, '%Array%'); },
			TypeError,
			debug(nonFunction) + ' is not a constructor'
		);
	});

	forEach(arrowFns, function (arrowFn) {
		t['throws'](
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

	var f = function () {};
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
