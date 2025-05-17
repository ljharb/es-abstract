'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var gOPD = require('gopd');
var functionsHaveNames = require('functions-have-names')();
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

module.exports = function (t, year, CreateMethodProperty) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { CreateMethodProperty(primitive, 'key'); },
			TypeError,
			'O must be an Object; ' + debug(primitive) + ' is not one'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { CreateMethodProperty({}, nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.test('defines correctly', function (st) {
		var obj = {};
		var key = 'the key';
		var value = { foo: 'bar' };

		st.equal(CreateMethodProperty(obj, key, value), true, 'defines property successfully');
		st.test('property descriptor', { skip: !gOPD }, function (s2t) {
			s2t.deepEqual(
				gOPD(obj, key),
				{
					configurable: true,
					enumerable: false,
					value: value,
					writable: true
				},
				'sets the correct property descriptor'
			);

			s2t.end();
		});
		st.equal(obj[key], value, 'sets the correct value');

		st.end();
	});

	t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
		var obj = Object.freeze({ foo: 'bar' });
		st['throws'](
			function () { CreateMethodProperty(obj, 'foo', { value: 'baz' }); },
			TypeError,
			'nonconfigurable key can not be defined'
		);

		st.end();
	});

	t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
		st['throws'](
			function () { CreateMethodProperty(function () {}, 'name', { value: 'baz' }); },
			TypeError,
			'nonconfigurable function name can not be defined'
		);
		st.end();
	});
};
