'use strict';

var v = require('es-value-fixtures');

module.exports = function (t, year, IterableToArrayLike) {
	t.equal(year, 2016, 'ES2016 only');

	t.test('custom iterables', { skip: !v.hasSymbols }, function (st) {
		var O = {};
		O[Symbol.iterator] = function () {
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
		st.deepEqual(
			IterableToArrayLike(O),
			[0, 1, 2, 3, 4],
			'Symbol.iterator method is called and values collected'
		);

		st.end();
	});

	t.deepEqual(IterableToArrayLike('abc'), ['a', 'b', 'c'], 'a string of code units spreads');
	t.deepEqual(IterableToArrayLike('💩'), ['💩'], 'a string of code points spreads');
	t.deepEqual(IterableToArrayLike('a💩c'), ['a', '💩', 'c'], 'a string of code points and units spreads');

	var arr = [1, 2, 3];
	t.deepEqual(IterableToArrayLike(arr), arr, 'an array becomes a similar array');
	t.notEqual(IterableToArrayLike(arr), arr, 'an array becomes a different, but similar, array');

	var O = {};
	t.equal(IterableToArrayLike(O), O, 'a non-iterable non-array non-string object is returned directly');
};
