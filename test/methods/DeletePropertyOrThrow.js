'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var functionsHaveNames = require('functions-have-names')();
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

/** @type {import('../testHelpers').MethodTest<'DeletePropertyOrThrow'>} */
module.exports = function (t, year, DeletePropertyOrThrow) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { DeletePropertyOrThrow(primitive, 'key', {}); },
			TypeError,
			'O must be an Object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			// @ts-expect-error
			function () { DeletePropertyOrThrow({}, nonPropertyKey, {}); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.test('defines correctly', function (st) {
		var obj = { 'the key': 42 };
		var key = /** @type {const} */ ('the key');

		st.equal(DeletePropertyOrThrow(obj, key), true, 'deletes property successfully');
		st.equal(key in obj, false, 'key is no longer in the object');

		st.end();
	});

	t.test('fails as expected on a frozen object', { skip: !Object.freeze }, function (st) {
		var obj = Object.freeze({ foo: 'bar' });
		st['throws'](
			function () { DeletePropertyOrThrow(obj, 'foo'); },
			TypeError,
			'nonconfigurable key can not be deleted'
		);

		st.end();
	});

	t.test('fails as expected on a function with a nonconfigurable name', { skip: !functionsHaveNames || functionsHaveConfigurableNames }, function (st) {
		st['throws'](
			function () { DeletePropertyOrThrow(function () {}, 'name'); },
			TypeError,
			'nonconfigurable function name can not be deleted'
		);
		st.end();
	});
};
