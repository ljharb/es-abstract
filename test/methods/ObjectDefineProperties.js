'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var fromPropertyDescriptor = require('../../helpers/fromPropertyDescriptor');

/** @type {import('../testHelpers').MethodTest<'ObjectDefineProperties'>} */
module.exports = function (t, year, ObjectDefineProperties) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			// @ts-expect-error
			function () { ObjectDefineProperties(nonObject); },
			debug(nonObject) + ' is not an Object'
		);
	});

	var sentinel = { sentinel: true };

	t.test('basic data properties', function (st) {
		var o = {};
		var result = ObjectDefineProperties(o, {
			foo: fromPropertyDescriptor(v.assignedDescriptor(42)),
			bar: fromPropertyDescriptor(v.assignedDescriptor(sentinel)),
			toString: fromPropertyDescriptor(v.assignedDescriptor('not Object.prototype.toString'))
		});

		st.equal(result, o, 'returns same object');
		st.deepEqual(
			o,
			{
				foo: 42,
				bar: sentinel,
				toString: 'not Object.prototype.toString'
			},
			'expected properties are installed'
		);

		st.end();
	});

	t.test('fancy stuff', function (st) {
		st.doesNotThrow(
			function () { ObjectDefineProperties({}, { foo: v.assignedDescriptor(42) }); },
			TypeError
		);

		var o = {};
		var result = ObjectDefineProperties(o, {
			foo: fromPropertyDescriptor(v.accessorDescriptor(42)),
			bar: fromPropertyDescriptor(v.descriptors.enumerable(v.descriptors.nonConfigurable(v.dataDescriptor(sentinel)))),
			toString: fromPropertyDescriptor(v.accessorDescriptor('not Object.prototype.toString'))
		});
		st.equal(result, o, 'returns same object');
		st.deepEqual(
			o,
			{
				foo: 42,
				bar: sentinel,
				toString: 'not Object.prototype.toString'
			},
			'expected properties are installed'
		);

		st.end();
	});
};
