'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var makeIteratorRecord = require('../helpers/makeIteratorRecord');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IteratorToList'>} */
module.exports = function (t, year, IteratorToList) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(esV.unknowns, function (nonIteratorRecord) {
		t['throws'](
			// @ts-expect-error
			function () { IteratorToList(nonIteratorRecord); },
			TypeError,
			debug(nonIteratorRecord) + ' is not an Iterator Record'
		);
	});

	var customIterator = function () {
		var i = -1;
		return {
			next: function () {
				i += 1;
				return {
					done: i >= 5,
					value: i
				};
			}
		};
	};

	var iteratorRecord = makeIteratorRecord(customIterator());

	t.deepEqual(
		IteratorToList(iteratorRecord),
		[0, 1, 2, 3, 4],
		'iterator method is called and values collected'
	);

	t.test('Symbol support', { skip: !v.hasSymbols }, function (st) {
		st.deepEqual(IteratorToList(makeIteratorRecord('abc'[Symbol.iterator]())), ['a', 'b', 'c'], 'a string of code units spreads');
		st.deepEqual(IteratorToList(makeIteratorRecord('☃'[Symbol.iterator]())), ['☃'], 'a string of code points spreads');

		var arr = [1, 2, 3];
		st.deepEqual(IteratorToList(makeIteratorRecord(arr[Symbol.iterator]())), arr, 'an array becomes a similar array');
		st.notEqual(IteratorToList(makeIteratorRecord(arr[Symbol.iterator]())), arr, 'an array becomes a different, but similar, array');

		st.end();
	});

	t['throws'](
		// @ts-expect-error
		function () { IteratorToList(makeIteratorRecord({})); },
		TypeError,
		'non-function iterator method'
	);
};
