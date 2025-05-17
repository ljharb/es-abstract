'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, CreateListFromArrayLike) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { CreateListFromArrayLike(nonObject); },
			TypeError,
			debug(nonObject) + ' is not an Object'
		);
	});
	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { CreateListFromArrayLike({}, nonArray); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t['throws'](
		function () { CreateListFromArrayLike({ length: 3, 0: 'a', 1: 'b', 2: 3 }, ['String']); },
		TypeError,
		'an element type not present in passed elementTypes throws'
	);

	t.deepEqual(
		CreateListFromArrayLike({ length: 2, 0: 'a', 1: 'b', 2: 'c' }),
		['a', 'b'],
		'arraylike stops at the length'
	);

	if (year >= 2020) {
		t.test('bigints', { skip: !esV.hasBigInts }, function (st) {
			st.deepEqual(
				CreateListFromArrayLike({ length: 2, 0: BigInt(1), 1: 'b', 2: 'c' }),
				[BigInt(1), 'b'],
				'arraylike (with BigInt) stops at the length'
			);

			st.end();
		});
	}
};
