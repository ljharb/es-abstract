'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, CreateDataPropertyOrThrow) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { CreateDataPropertyOrThrow(primitive); },
			TypeError,
			debug(primitive) + ' is not an object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { CreateDataPropertyOrThrow({}, nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a property key'
		);
	});

	var sentinel = {};
	forEach(v.propertyKeys, function (propertyKey) {
		var obj = {};
		var status = CreateDataPropertyOrThrow(obj, propertyKey, sentinel);
		if (year < 2023) {
			t.equal(status, true, 'status is true');
		} else {
			t.equal(status, undefined, 'status is ~unused~');
		}
		t.equal(
			obj[propertyKey],
			sentinel,
			debug(sentinel) + ' is installed on "' + debug(propertyKey) + '" on the object'
		);

		if (typeof Object.preventExtensions === 'function') {
			var notExtensible = {};
			Object.preventExtensions(notExtensible);

			t['throws'](
				function () { CreateDataPropertyOrThrow(notExtensible, propertyKey, sentinel); },
				TypeError,
				'can not install ' + debug(propertyKey) + ' on non-extensible object'
			);
			t.notOk(
				propertyKey in notExtensible,
				debug(sentinel) + ' is not installed on "' + debug(propertyKey) + '" on the object'
			);
		}
	});

	t.test('non-extensible object', { skip: !Object.preventExtensions }, function (st) {
		var nonExtensible = Object.preventExtensions({});

		st['throws'](
			function () { CreateDataPropertyOrThrow(nonExtensible, 'foo', {}); },
			TypeError,
			'can not install "foo" on non-extensible object'
		);

		st.end();
	});
};
