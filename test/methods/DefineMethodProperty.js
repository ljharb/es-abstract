'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var gOPD = require('gopd');

var defineProperty = require('../helpers/defineProperty');

/** @type {import('../testHelpers').MethodTest<'DefineMethodProperty'>} */
module.exports = function (t, year, DefineMethodProperty) {
	t.ok(year >= 2022, 'ES2022+');

	var enumerable = true;
	var nonEnumerable = false;

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			// @ts-expect-error
			function () { DefineMethodProperty(nonObject, 'key', function () {}, enumerable); },
			TypeError,
			'O must be an Object; ' + debug(nonObject) + ' is not one'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			// @ts-expect-error
			function () { DefineMethodProperty({}, nonPropertyKey, function () {}, enumerable); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { DefineMethodProperty({}, 'key', nonFunction, enumerable); },
			TypeError,
			debug(nonFunction) + ' is not a Function'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { DefineMethodProperty({}, 'key', function () {}, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
		var obj = {};
		Object.preventExtensions(obj);

		st['throws'](
			function () { DefineMethodProperty(obj, 'key', function () {}, enumerable); },
			TypeError,
			'non-extensible object can not have a method defined'
		);

		st.end();
	});

	t.test('defining an enumerable method', function (st) {
		/** @type {Record<string, unknown>} */
		var obj = {};
		var key = 'the key';
		var value = function () {};

		st.doesNotThrow(
			function () { DefineMethodProperty(obj, key, value, enumerable); },
			'defines property successfully'
		);

		st.equal(obj[key], value, 'sets the correct value');
		st.deepEqual(
			gOPD(obj, key),
			{
				configurable: true,
				enumerable: true,
				value: value,
				writable: true
			},
			'sets the correct property descriptor'
		);

		st.end();
	});

	// test defining a non-enumerable property when descriptors are supported
	t.test('defining a non-enumerable method', { skip: !defineProperty || !gOPD }, function (st) {
		if (!defineProperty || !gOPD) {
			st.fail();
			return;
		}
		/** @type {Record<string, unknown>} */
		var obj = {};
		var key = 'the key';
		var value = function () {};

		st.doesNotThrow(
			function () { DefineMethodProperty(obj, key, value, nonEnumerable); },
			'defines property successfully'
		);

		st.equal(obj[key], value, 'sets the correct value');
		st.deepEqual(
			gOPD(obj, key),
			{
				configurable: true,
				enumerable: false,
				value: value,
				writable: true
			},
			'sets the correct property descriptor'
		);

		st.end();
	});

	// test defining over a nonconfigurable property when descriptors are supported (unless there's an ES3 builtin that's nonconfigurable)
	t.test('defining over a nonconfigurable property', { skip: !defineProperty || !gOPD }, function (st) {
		/** @type {Record<string, unknown>} */
		var obj = {};
		var key = 'the key';
		defineProperty(obj, key, {
			configurable: false,
			enumerable: true,
			value: 'foo',
			writable: true
		});
		var value = function () {};

		st['throws'](
			function () { DefineMethodProperty(obj, key, value, enumerable); },
			TypeError,
			'nonconfigurable key can not be redefined'
		);

		st.end();
	});
};
