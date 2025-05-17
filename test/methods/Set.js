'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $defineProperty = require('es-define-property');

var defineProperty = require('../helpers/defineProperty');
var esV = require('../helpers/v');

module.exports = function (t, year, Set) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { Set(primitive, '', null, false); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonKey) {
		t['throws'](
			function () { Set({}, nonKey, null, false); },
			TypeError,
			debug(nonKey) + ' is not a Property Key'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { Set({}, '', null, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	var o = {};
	var value = {};
	Set(o, 'key', value, true);
	t.deepEqual(o, { key: value }, 'key is set');

	t.test('nonwritable', { skip: !$defineProperty }, function (st) {
		var obj = { a: value };
		defineProperty(obj, 'a', { writable: false });

		st['throws'](
			function () { Set(obj, 'a', {}, true); },
			TypeError,
			'can not Set nonwritable property'
		);

		st.doesNotThrow(
			function () {
				st.equal(Set(obj, 'a', {}, false), false, 'unsuccessful Set returns false');
			},
			'setting Throw to false prevents an exception'
		);

		st.end();
	});

	t.test('nonconfigurable', { skip: !$defineProperty }, function (st) {
		var obj = { a: value };
		defineProperty(obj, 'a', { configurable: false });

		st.equal(Set(obj, 'a', value, true), true, 'successful Set returns true');
		st.deepEqual(obj, { a: value }, 'key is set');

		st.end();
	});

	t.test('doesn’t call [[Get]] in conforming strict mode environments', { skip: esV.noThrowOnStrictViolation }, function (st) {
		var getterCalled = false;
		var setterCalls = 0;
		var obj = {};
		defineProperty(obj, 'a', {
			get: function () {
				getterCalled = true;
			},
			set: function () {
				setterCalls += 1;
			}
		});

		st.equal(Set(obj, 'a', value, false), true, 'successful Set returns true');
		st.equal(setterCalls, 1, 'setter was called once');
		st.equal(getterCalled, false, 'getter was not called');

		st.end();
	});
};
