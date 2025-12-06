'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, actual) {
	t.ok(year >= 2022, 'ES2022+');

	var SortIndexedProperties = year >= 2023 ? actual : function SortIndexedProperties(obj, len, SortCompare, holes) {
		return actual(obj, len, SortCompare);
	};

	/* eslint no-unused-vars: 0 */

	var emptySortCompare = function (a, b) {};

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { SortIndexedProperties(primitive, 0, emptySortCompare, 'skip-holes'); },
			TypeError,
			'obj must be an Object; ' + debug(primitive) + ' is not one'
		);
	});

	forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
		t['throws'](
			function () { SortIndexedProperties({}, nonNonNegativeInteger, emptySortCompare, 'skip-holes'); },
			TypeError,
			'`len`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	forEach(
		[].concat(
			v.nonFunctions,
			function () {},
			function f(a, b) { return 0; },
			function (a) { return 0; },
			v.arrowFunctions.length > 0 ? [
				/* eslint no-new-func: 1 */
				Function('return () => {}')(),
				Function('return (a) => {}')(),
				Function('return (a, b, c) => {}')()
			] : []
		),
		function (nonTwoArgAbstractClosure) {
			t['throws'](
				function () { SortIndexedProperties({}, 0, nonTwoArgAbstractClosure, 'skip-holes'); },
				TypeError,
				'`len`: ' + debug(nonTwoArgAbstractClosure) + ' is not an abstract closure taking two args'
			);
		}
	);

	forEach([].concat(
		function (a, b) { return 0; },
		v.arrowFunctions.length > 0 ? [
			Function('return (a, b) => 0')()
		] : []
	), function (ac) {
		t.doesNotThrow(
			function () { SortIndexedProperties({}, 0, ac, 'skip-holes'); },
			'an abstract closure taking two args is accepted'
		);
	});

	var o = [1, 3, 2, 0];
	if (year >= 2023) {
		t.deepEqual(
			SortIndexedProperties(o, 3, function (a, b) { return a - b; }, 'skip-holes'),
			[1, 2, 3],
			'new array is returned'
		);
		t.deepEqual(
			o,
			[1, 3, 2, 0],
			'original object is not sorted'
		);

		t.deepEqual(
			SortIndexedProperties(o, 4, function (a, b) { return a - b; }, 'skip-holes'),
			[0, 1, 2, 3],
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[1, 3, 2, 0],
			'original object is not sorted'
		);

		t.deepEqual(
			SortIndexedProperties(o, 6, function (a, b) { return a - b; }, 'skip-holes'),
			[0, 1, 2, 3],
			'new array is again sorted up to `len` when `len` is longer than than `o.length`'
		);
		t.deepEqual(
			o,
			[1, 3, 2, 0],
			'original object is not sorted'
		);
	} else {
		t.equal(
			SortIndexedProperties(o, 3, function (a, b) { return a - b; }, 'skip-holes'),
			o,
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[1, 2, 3, 0],
			'object is sorted up to `len`'
		);

		o = [1, 3, 2, 0];
		t.equal(
			SortIndexedProperties(o, 4, function (a, b) { return a - b; }, 'skip-holes'),
			o,
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[0, 1, 2, 3],
			'object is again sorted up to `len`'
		);

		o = [1, 3, 2, 0];
		t.equal(
			SortIndexedProperties(o, 6, function (a, b) { return a - b; }, 'skip-holes'),
			o,
			'passed object is returned'
		);
		t.deepEqual(
			o,
			[0, 1, 2, 3],
			'object is again sorted up to `len` when `len` is longer than than `o.length`'
		);
	}

	if (year >= 2023) {
		t['throws'](
			function () { SortIndexedProperties({}, 0, emptySortCompare, ''); },
			TypeError,
			'`holes`: only enums allowed'
		);

		var obj = [1, 3, 2, 0];

		forEach(['skip-holes', 'read-through-holes'], function (holes) {
			t.deepEqual(
				SortIndexedProperties(
					obj,
					3,
					function (a, b) { return a - b; },
					holes
				),
				[1, 2, 3],
				holes + ': sorted items are returned, up to the expected length of the object'
			);

			t.deepEqual(
				SortIndexedProperties(
					obj,
					4,
					function (a, b) { return b - a; },
					holes
				),
				[3, 2, 1, 0],
				holes + ': sorted items are returned'
			);
		});

		t.deepEqual(
			SortIndexedProperties(
				obj,
				6,
				function (a, b) { return a - b; },
				'read-through-holes'
			),
			[0, 1, 2, 3, undefined, undefined],
			'read-through-holes: sorted items are returned'
		);
		t.deepEqual(
			SortIndexedProperties(
				obj,
				6,
				function (a, b) { return a - b; },
				'skip-holes'
			),
			[0, 1, 2, 3],
			'skip-holes: sorted items are returned, holes skipped'
		);

	}

	// TODO: tests with holes
};
