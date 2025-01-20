'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, actual) {
	t.ok(year >= 2023, 'ES2023+');

	var FindViaPredicate = year >= 2024 ? actual : function FindViaPredicate(O, len, direction, predicate, thisArg) {
		return actual(O, len, direction.toLowerCase(), predicate, thisArg);
	};

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { FindViaPredicate(primitive, 0, 'ASCENDING', function () {}); },
			TypeError,
			debug(primitive) + ' is not an object'
		);
	});

	forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
		t['throws'](
			function () { FindViaPredicate({}, notNonNegativeInteger, 'ASCENDING', function () {}); },
			TypeError,
			debug(notNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { FindViaPredicate({}, 0, 'ASCENDING', nonFunction); },
			TypeError,
			debug(nonFunction) + ' is not a function'
		);
	});

	t['throws'](
		function () { FindViaPredicate({}, 0, 'invalid', function () {}); },
		TypeError,
		'invalid direction'
	);

	var sentinel = {};
	var arr = [1, 2, 3, 4];
	var fakeLength = 3;
	t.test('ascending', function (st) {
		var expectedIndex = 1;
		st.plan(((expectedIndex + 1) * 3) + 1);

		var result = FindViaPredicate(arr, fakeLength, 'ASCENDING', function (element, index, obj) {
			st.equal(element, arr[index], 'first callback arg is in O, at second callback arg');
			st.equal(obj, arr, 'third callback arg is O');
			st.equal(this, sentinel, 'callback receiver is thisArg');

			return element % 2 === 0;
		}, sentinel);

		st.deepEqual(result, { '[[Index]]': expectedIndex, '[[Value]]': 2 }, 'expected result is found');

		st.end();
	});

	t.test('descending', function (st) {
		var expectedIndex = 3;
		st.plan((((arr.length - expectedIndex) + 1) * 3) + 1);

		var result = FindViaPredicate(arr, fakeLength, 'descending', function (element, index, obj) {
			st.equal(element, arr[index], 'first callback arg is in O, at second callback arg');
			st.equal(obj, arr, 'third callback arg is O');
			st.equal(this, sentinel, 'callback receiver is thisArg');

			return element % 2 === 0;
		}, sentinel);

		st.deepEqual(result, { '[[Index]]': 3, '[[Value]]': 4 }, 'expected result is found');

		st.end();
	});

	t.test('not found', function (st) {
		st.plan((fakeLength * 3) + 1);

		var result = FindViaPredicate(arr, fakeLength, 'ASCENDING', function (element, index, obj) {
			st.equal(element, arr[index], 'first callback arg is in O, at second callback arg (' + index + ')');
			st.equal(obj, arr, 'third callback arg is O');
			st.equal(this, sentinel, 'callback receiver is thisArg');

			return false;
		}, sentinel);

		st.deepEqual(result, { '[[Index]]': -1, '[[Value]]': void undefined }, 'expected result is produced');

		st.end();
	});
};
