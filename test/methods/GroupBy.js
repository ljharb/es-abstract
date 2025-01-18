'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'GroupBy'>} */
module.exports = function (t, year, GroupBy) {
	t.ok(year >= 2024, 'ES2024+');

	t['throws'](
		// @ts-expect-error
		function () { GroupBy([], function () {}, 'unknown'); },
		TypeError,
		'keyCoercion is not ~PROPERTY~ or ~ZERO~'
	);

	forEach(v.nullPrimitives, function (nullish) {
		t['throws'](
			// @ts-expect-error
			function () { GroupBy(nullish, function () {}, 'PROPERTY'); },
			TypeError,
			debug(nullish) + ' is not an Object'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { GroupBy([], nonFunction, 'PROPERTY'); },
			TypeError,
			debug(nonFunction) + ' is not a Function'
		);
	});

	forEach(v.nonStrings, function (nonIterable) {
		t['throws'](
			// @ts-expect-error
			function () { GroupBy(nonIterable, function () {}, 'PROPERTY'); },
			TypeError,
			debug(nonIterable) + ' is not iterable'
		);
	});

	var tenEx = t.captureFn(/** @param {number} x */ function (x) { return x * 10; });
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

	var negate = t.captureFn(/** @param {number} x */ function (x) { return -x; });
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

	// TODO: add a test for the callback throwing, that the iterator is closed

	// TODO: add a test for the callback return coercion throwing, that the iterator is closed
};
