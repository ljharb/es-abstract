'use strict';

var hasStrictMode = require('has-strict-mode')();

/** @type {import('../testHelpers').MethodTest<'FlattenIntoArray'>} */
module.exports = function (t, year, FlattenIntoArray) {
	t.ok(year >= 2019, 'ES2019+');

	t.test('no mapper function', function (st) {
		/** @type {(tt: import('tape').Test, depth: number, expected: unknown[]) => void} */
		var testDepth = function testDepth(tt, depth, expected) {
			/** @type {typeof expected} */
			var a = [];
			var o = [[1], 2, , [[3]], [], 4, [[[[5]]]]]; // eslint-disable-line no-sparse-arrays
			FlattenIntoArray(a, o, o.length, 0, depth);
			tt.deepEqual(a, expected, 'depth: ' + depth);
		};

		testDepth(st, 1, [1, 2, [3], 4, [[[5]]]]);
		testDepth(st, 2, [1, 2, 3, 4, [[5]]]);
		testDepth(st, 3, [1, 2, 3, 4, [5]]);
		testDepth(st, 4, [1, 2, 3, 4, 5]);
		testDepth(st, Infinity, [1, 2, 3, 4, 5]);
		st.end();
	});

	t.test('mapper function', function (st) {
		/** @type {(tt: import('tape').Test, mapper: import('../../types').Func, expected: unknown[], thisArg?: unknown) => void} */
		var testMapper = function testMapper(tt, mapper, expected, thisArg) {
			/** @type {typeof expected} */
			var a = [];
			var o = [[1], 2, , [[3]], [], 4, [[[[5]]]]]; // eslint-disable-line no-sparse-arrays
			FlattenIntoArray(a, o, o.length, 0, 1, mapper, thisArg);
			tt.deepEqual(a, expected);
		};

		st['throws'](
			function () {
				var o = [[1], 2, , [[3]], [], 4, [[[[5]]]]]; // eslint-disable-line no-sparse-arrays
				FlattenIntoArray([], o, o.length, 0, 1, function () {});
			},
			TypeError,
			'missing thisArg throws'
		);

		/** @param {unknown} x */
		function double(x) {
			return typeof x === 'number' ? 2 * x : x;
		}
		testMapper(
			st,
			double,
			[1, 4, [3], 8, [[[5]]]]
		);
		var receiver = hasStrictMode ? 42 : Object(42);
		testMapper(
			st,
			/** @type {<T>(this: T, x: unknown) => [T, unknown]} */
			function (x) { return [this, double(x)]; },
			[receiver, [1], receiver, 4, receiver, [[3]], receiver, [], receiver, 8, receiver, [[[[5]]]]],
			42
		);
		st.end();
	});
};
