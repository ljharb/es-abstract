'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'AddEntriesFromIterable'>} */
module.exports = function (t, year, AddEntriesFromIterable) {
	t.ok(year >= 2019, 'ES2019+');

	t['throws'](
		// @ts-expect-error
		function () { AddEntriesFromIterable({}, undefined, function () {}); },
		TypeError,
		'iterable must not be undefined'
	);
	t['throws'](
		// @ts-expect-error
		function () { AddEntriesFromIterable({}, null, function () {}); },
		TypeError,
		'iterable must not be null'
	);
	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { AddEntriesFromIterable({}, {}, nonFunction); },
			TypeError,
			debug(nonFunction) + ' is not a function'
		);
	});

	t.test('Symbol support', { skip: !v.hasSymbols }, function (st) {
		st.plan(5 + v.primitives.length);

		var O = {};
		st.equal(AddEntriesFromIterable(O, [], function () {}), O, 'returns the target');

		/** @type {(this: unknown, key: unknown, value: unknown) => void} */
		var adder = function (key, value) {
			st.equal(this, O, 'adder gets proper receiver');
			st.equal(key, 0, 'k is key');
			st.equal(value, 'a', 'v is value');
		};
		AddEntriesFromIterable(O, ['a'].entries(), adder);

		forEach(v.primitives, function (primitive) {
			var badIterator = {
				next: function next() {
					return {
						done: false,
						value: primitive
					};
				}
			};
			/** @type {{ [Symbol.iterator]?: unknown }} */
			var badIterable = {};
			badIterable[Symbol.iterator] = function () { return badIterator; };

			st['throws'](
				// @ts-expect-error
				function () { AddEntriesFromIterable(O, badIterable, adder); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});

		/** @type {(key: unknown, value: unknown) => void} */
		var badder = function (key, value) {
			// @ts-expect-error
			throw new EvalError(key + value);
		};
		st['throws'](
			function () { AddEntriesFromIterable(O, [[1, 2]], badder); },
			EvalError,
			'bad adder throws'
		);

		st.end();
	});
};
