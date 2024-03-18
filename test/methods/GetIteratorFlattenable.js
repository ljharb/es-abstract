'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var isObject = require('es-object-atoms/isObject');

module.exports = function (t, year, GetIteratorFlattenable) {
	t.ok(year >= 2025, 'ES2025+');

	t['throws'](
		function () { GetIteratorFlattenable({}, 'bad enum value'); },
		TypeError,
		'bad enum value throws'
	);

	forEach(v.nonObjects, function (primitive) {
		t['throws'](
			function () { GetIteratorFlattenable(primitive, 'REJECT-PRIMITIVES'); },
			TypeError,
			'REJECT-PRIMITIVES: ' + debug(primitive) + ' is not an object'
		);
	});

	forEach(v.nonStrings, function (nonString) {
		if (!isObject(nonString)) {
			t['throws'](
				function () { GetIteratorFlattenable(nonString, 'ITERATE-STRING-PRIMITIVES'); },
				TypeError,
				'ITERATE-STRING-PRIMITIVES + nonStrings: ' + debug(nonString) + ' is a primitive and not a string'
			);
		}
	});

	t.test('string iterator', function (st) {
		var stringIter = GetIteratorFlattenable('abc', 'ITERATE-STRING-PRIMITIVES');
		st.deepEqual(
			stringIter,
			{
				'[[Iterator]]': stringIter['[[Iterator]]'],
				'[[NextMethod]]': stringIter['[[NextMethod]]'],
				'[[Done]]': false
			},
			'returns string’s iterator record'
		);
		st.equal(typeof stringIter['[[NextMethod]]'], 'function', 'next method is a function');
		var a = stringIter['[[NextMethod]]'].call(stringIter['[[Iterator]]']);
		st.deepEqual(a, { value: 'a', done: false }, 'first next method call returns the expected iterator result');
		var b = stringIter['[[NextMethod]]'].call(stringIter['[[Iterator]]']);
		st.deepEqual(b, { value: 'b', done: false }, 'second next method call returns the expected iterator result');
		var c = stringIter['[[NextMethod]]'].call(stringIter['[[Iterator]]']);
		st.deepEqual(c, { value: 'c', done: false }, 'third next method call returns the expected iterator result');
		var d = stringIter['[[NextMethod]]'].call(stringIter['[[Iterator]]']);
		st.deepEqual(d, { value: void undefined, done: true }, 'fourth next method call returns the expected final iterator result');

		st.end();
	});

	t.test('array iterator', function (st) {
		var iterable = [1, 2, 3];
		var result = GetIteratorFlattenable(iterable, 'REJECT-PRIMITIVES');

		st.deepEqual(
			result,
			{
				'[[Iterator]]': result['[[Iterator]]'],
				'[[NextMethod]]': result['[[NextMethod]]'],
				'[[Done]]': false
			},
			'returns iterable’s iterator record'
		);
		st.equal(typeof result['[[NextMethod]]'], 'function', 'next method is a function');

		var a = result['[[NextMethod]]'].call(result['[[Iterator]]']);
		st.deepEqual(a, { value: 1, done: false }, 'first next method call returns the expected iterator result');
		var b = result['[[NextMethod]]'].call(result['[[Iterator]]']);
		st.deepEqual(b, { value: 2, done: false }, 'second next method call returns the expected iterator result');
		var c = result['[[NextMethod]]'].call(result['[[Iterator]]']);
		st.deepEqual(c, { value: 3, done: false }, 'third next method call returns the expected iterator result');
		var d = result['[[NextMethod]]'].call(result['[[Iterator]]']);
		st.deepEqual(d, { value: void undefined, done: true }, 'fourth next method call returns the expected final iterator result');

		st.end();
	});

	var nonIterable = { nonIterable: true };
	var result = GetIteratorFlattenable(nonIterable, 'REJECT-PRIMITIVES');
	t.deepEqual(
		result,
		{
			'[[Iterator]]': nonIterable,
			'[[NextMethod]]': undefined,
			'[[Done]]': false
		},
		'returns non-iterable’s iterator record'
	);

	t.test('iterable with a bad next method', { skip: !v.hasSymbols }, function (st) {
		forEach(v.primitives, function (primitive) {
			var next = function () { return primitive; };
			var iterable = {};
			iterable[Symbol.iterator] = next;

			st['throws'](
				function () { GetIteratorFlattenable(iterable, 'REJECT-PRIMITIVES'); },
				TypeError,
				'an iterable’s next method returned ' + debug(primitive) + ' instead of an object'
			);
		});
		st.end();
	});
};
