'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $defineProperty = require('es-define-property');

var defineProperty = require('../helpers/defineProperty');

/** @type {import('../testHelpers').MethodTest<'CreateDataProperty'>} */
module.exports = function (t, year, CreateDataProperty) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { CreateDataProperty(primitive); },
			TypeError,
			debug(primitive) + ' is not an object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			// @ts-expect-error
			function () { CreateDataProperty({}, nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a property key'
		);
	});

	var sentinel = { id: 'sentinel' };
	var secondSentinel = { id: 'second sentinel' };
	forEach(v.propertyKeys, function (propertyKey) {
		/** @type {Record<PropertyKey, unknown>} */
		var obj = {};
		var status = CreateDataProperty(obj, propertyKey, sentinel);
		t.equal(status, true, 'status is true');
		t.equal(
			obj[propertyKey],
			sentinel,
			debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
		);
		var secondStatus = CreateDataProperty(obj, propertyKey, secondSentinel);
		t.equal(secondStatus, true, 'second status is true');
		t.equal(
			obj[propertyKey],
			secondSentinel,
			debug(secondSentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
		);

		t.test('with defineProperty', { skip: !$defineProperty }, function (st) {
			var nonWritable = defineProperty({}, propertyKey, { configurable: true, writable: false });

			var nonWritableStatus = CreateDataProperty(nonWritable, propertyKey, sentinel);
			st.equal(nonWritableStatus, true, 'create data property succeeded');
			st.equal(
				nonWritable[propertyKey],
				sentinel,
				debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object when key is configurable but nonwritable'
			);

			var nonConfigurable = defineProperty({}, propertyKey, { configurable: false, writable: true });

			var nonConfigurableStatus = CreateDataProperty(nonConfigurable, propertyKey, sentinel);
			st.equal(nonConfigurableStatus, false, 'create data property failed');
			st.notEqual(
				nonConfigurable[propertyKey],
				sentinel,
				debug(sentinel) + ' is not installed on "' + debug(propertyKey) + '" on the object when key is nonconfigurable'
			);
			st.end();
		});
	});

	t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
		var nonExtensible = Object.preventExtensions({});

		st.equal(
			CreateDataProperty(nonExtensible, 'foo', {}),
			false,
			'can not install "foo" on non-extensible object'
		);

		st.end();
	});
};
