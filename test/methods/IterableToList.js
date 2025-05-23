'use strict';

var v = require('es-value-fixtures');

module.exports = function (t, year, IterableToList) {
	t.ok(year >= 2017, 'ES2017+');

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

	t.deepEqual(
		IterableToList({}, customIterator),
		[0, 1, 2, 3, 4],
		'iterator method is called and values collected'
	);

	t.test('Symbol support', { skip: !v.hasSymbols }, function (st) {
		st.deepEqual(IterableToList('abc', String.prototype[Symbol.iterator]), ['a', 'b', 'c'], 'a string of code units spreads');
		st.deepEqual(IterableToList('☃', String.prototype[Symbol.iterator]), ['☃'], 'a string of code points spreads');

		var arr = [1, 2, 3];
		st.deepEqual(IterableToList(arr, arr[Symbol.iterator]), arr, 'an array becomes a similar array');
		st.notEqual(IterableToList(arr, arr[Symbol.iterator]), arr, 'an array becomes a different, but similar, array');

		st.end();
	});

	t['throws'](
		function () { IterableToList({}, void 0); },
		TypeError,
		'non-function iterator method'
	);

	if (year >= 2021) {
		t.deepEqual(
			IterableToList(['a', 'b', 'c']),
			['a', 'b', 'c'],
			'method is optional in ES2021+'
		);
	}
};
