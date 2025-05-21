'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, GroupBy) {
	t.ok(year >= 2024, 'ES2024+');

	t['throws'](function () { GroupBy([], function () {}, 'unknown'); }, 'keyCoercion is not ~PROPERTY~ or ~ZERO~');

	forEach(v.nullPrimitives, function (nullish) {
		t['throws'](
			function () { GroupBy(nullish, function () {}, 'PROPERTY'); },
			TypeError,
			debug(nullish) + ' is not an Object'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { GroupBy([], nonFunction, 'PROPERTY'); },
			TypeError,
			debug(nonFunction) + ' is not a Function'
		);
	});

	forEach(v.nonStrings, function (nonIterable) {
		t['throws'](
			function () { GroupBy(nonIterable, function () {}, 'PROPERTY'); },
			TypeError,
			debug(nonIterable) + ' is not iterable'
		);
	});

	var tenEx = t.captureFn(function (x) { return x * 10; });
	var result = GroupBy([-0, 0, 1, 2], tenEx, 'PROPERTY');
	t.deepEqual(
		result,
		[
			{ '[[Key]]': '0', '[[Elements]]': [-0, 0] },
			{ '[[Key]]': '10', '[[Elements]]': [1] },
			{ '[[Key]]': '20', '[[Elements]]': [2] }
		],
		'groups by property'
	);
	t.deepEqual(tenEx.calls, [
		{ args: [-0, 0], receiver: undefined, returned: -0 },
		{ args: [0, 1], receiver: undefined, returned: 0 },
		{ args: [1, 2], receiver: undefined, returned: 10 },
		{ args: [2, 3], receiver: undefined, returned: 20 }
	]);

	// TODO: maybe add a test for "larger than max safe int"?

	var negate = t.captureFn(function (x) { return -x; });
	var resultZero = GroupBy([-0, 0, 1, 2], negate, 'ZERO');
	t.deepEqual(
		resultZero,
		[
			{ '[[Key]]': 0, '[[Elements]]': [-0, 0] },
			{ '[[Key]]': -1, '[[Elements]]': [1] },
			{ '[[Key]]': -2, '[[Elements]]': [2] }
		],
		'groups with SameValueZero'
	);
	t.deepEqual(negate.calls, [
		{ args: [-0, 0], receiver: undefined, returned: 0 },
		{ args: [0, 1], receiver: undefined, returned: -0 },
		{ args: [1, 2], receiver: undefined, returned: -1 },
		{ args: [2, 3], receiver: undefined, returned: -2 }
	]);

	t['throws'](
		function () { GroupBy([1, 2, 3], function (x) { throw new EvalError(x); }, 'PROPERTY'); },
		EvalError,
		'callback throws -> throw'
	);

	t.test('has Symbol.iterator', { skip: !v.hasSymbols }, function (st) {
		var iter = [1, 2, 3][Symbol.iterator]();
		iter['return'] = st.captureFn(function () {});

		st['throws'](
			function () { GroupBy(iter, function (x) { if (x === 2) { throw new EvalError(x); } return x; }, 'PROPERTY'); },
			EvalError,
			'callback throws -> throw'
		);

		st.deepEqual(
			iter['return'].calls,
			[
				{ args: [], receiver: iter, returned: undefined }
			],
			'iterator was closed'
		);

		var iterC = [{ toString: function () { throw new EvalError(); } }][Symbol.iterator]();
		iterC['return'] = t.captureFn(function () {});
		st['throws'](
			function () { GroupBy(iterC, function (x) { return x; }, 'PROPERTY'); },
			EvalError,
			'key coercion throws -> throw'
		);
		st.deepEqual(
			iterC['return'].calls,
			[
				{ args: [], receiver: iterC, returned: undefined }
			],
			'iterator was closed'
		);

		st.end();
	});

	var iterable = [{ toString: function () { throw new EvalError(); } }];
	t['throws'](
		function () { GroupBy(iterable, function (x) { return x; }, 'PROPERTY'); },
		EvalError,
		'key coercion throws -> throw'
	);
};
