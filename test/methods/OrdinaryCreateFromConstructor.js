'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var SLOT = require('internal-slot');

/** @type {import('../testHelpers').MethodTest<'OrdinaryCreateFromConstructor'>} */
module.exports = function (t, year, OrdinaryCreateFromConstructor) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { OrdinaryCreateFromConstructor(nonFunction, '%Array.prototype%'); },
			TypeError,
			debug(nonFunction) + ' is not a constructor'
		);
	});

	forEach(v.arrowFunctions, function (arrowFn) {
		t['throws'](
			// @ts-expect-error
			function () { OrdinaryCreateFromConstructor(arrowFn, '%Array.prototype%'); },
			TypeError,
			debug(arrowFn) + ' is not a constructor'
		);
	});

	t.test('proto arg', function (st) {
		/** @constructor */
		function Parent() {}
		Parent.prototype.foo = {};
		var child = OrdinaryCreateFromConstructor(Parent, '%Array.prototype%');
		st.equal(child instanceof Parent, true, 'child is instanceof Parent');
		st.equal(child instanceof Array, false, 'child is not instanceof Array');
		st.equal(child.foo, Parent.prototype.foo, 'child inherits properties from Parent.prototype');

		st.end();
	});

	t.test('internal slots arg', function (st) {
		st.doesNotThrow(
			function () { OrdinaryCreateFromConstructor(function () {}, '%Array.prototype%', []); },
			'an empty slot list is valid'
		);

		var O = OrdinaryCreateFromConstructor(function () {}, '%Array.prototype%', ['a', 'b']);
		st.doesNotThrow(
			function () {
				SLOT.assert(O, 'a');
				SLOT.assert(O, 'b');
			},
			'expected internal slots exist'
		);
		st['throws'](
			function () { SLOT.assert(O, 'c'); },
			TypeError,
			'internal slots that should not exist throw'
		);

		st.end();
	});
};
