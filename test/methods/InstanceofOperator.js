'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var defineProperty = require('../helpers/defineProperty');

/** @type {import('../testHelpers').MethodTest<'InstanceofOperator'>} */
module.exports = function (t, year, InstanceofOperator) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { InstanceofOperator(primitive, function () {}); },
			TypeError,
			debug(primitive) + ' is not an object'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { InstanceofOperator({}, nonFunction); },
			TypeError,
			debug(nonFunction) + ' is not callable'
		);
	});

	/** @constructor */
	function C() {}
	/** @constructor */
	function D() {}

	t.equal(InstanceofOperator(new C(), C), true, 'constructor function has an instance of itself');
	t.equal(InstanceofOperator(new D(), C), false, 'constructor/instance mismatch is false');
	t.equal(InstanceofOperator(new C(), D), false, 'instance/constructor mismatch is false');
	t.equal(InstanceofOperator({}, C), false, 'plain object is not an instance of a constructor');
	t.equal(InstanceofOperator({}, Object), true, 'plain object is an instance of Object');

	t.test('Symbol.hasInstance', { skip: !v.hasSymbols || !Symbol.hasInstance }, function (st) {
		st.plan(5);

		var O = {};
		/** @constructor */
		function C2() {}
		st.equal(InstanceofOperator(O, C2), false, 'O is not an instance of C2');

		defineProperty(C2, Symbol.hasInstance, {
			configurable: true,
			value: /** @type {(this: C2, obj: unknown) => unknown} */ function (obj) {
				st.equal(this, C2, 'hasInstance receiver is C2');
				st.equal(obj, O, 'hasInstance argument is O');

				return {}; // testing coercion to boolean
			}
		});

		st.equal(InstanceofOperator(O, C2), true, 'O is now an instance of C2');

		defineProperty(C2, Symbol.hasInstance, {
			configurable: true,
			value: undefined
		});

		st.equal(InstanceofOperator(O, C2), false, 'O is no longer an instance of C2');

		st.end();
	});
};
