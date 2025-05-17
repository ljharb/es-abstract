'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var gOPD = require('gopd');
var debug = require('object-inspect');
var functionsHaveNames = require('functions-have-names')();
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

module.exports = function (t, year, DefinePropertyOrThrow) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { DefinePropertyOrThrow(primitive, 'key', {}); },
			TypeError,
			'O must be an Object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { DefinePropertyOrThrow({}, nonPropertyKey, {}); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.test('defines correctly', function (st) {
		var obj = {};
		var key = 'the key';
		var descriptor = {
			configurable: true,
			enumerable: false,
			value: { foo: 'bar' },
			writable: true
		};

		st.equal(DefinePropertyOrThrow(obj, key, descriptor), true, 'defines property successfully');
		st.test('property descriptor', { skip: !gOPD }, function (s2t) {
			s2t.deepEqual(
				gOPD(obj, key),
				descriptor,
				'sets the correct property descriptor'
			);

			s2t.end();
		});
		st.deepEqual(obj[key], descriptor.value, 'sets the correct value');

		st.end();
	});

	t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
		var obj = Object.freeze({ foo: 'bar' });
		st['throws'](
			function () {
				DefinePropertyOrThrow(obj, 'foo', { configurable: true, value: 'baz' });
			},
			TypeError,
			'nonconfigurable key can not be defined'
		);

		st.end();
	});

	t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
		st['throws'](
			function () {
				DefinePropertyOrThrow(function () {}, 'name', { configurable: true, value: 'baz' });
			},
			TypeError,
			'nonconfigurable function name can not be defined'
		);
		st.end();
	});
};
