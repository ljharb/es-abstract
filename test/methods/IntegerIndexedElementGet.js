'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var availableTypedArrays = require('available-typed-arrays')();
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');

module.exports = function (t, year, IntegerIndexedElementGet, extras) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { IntegerIndexedElementGet(null, nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			function () { IntegerIndexedElementGet(nonTA, 0); },
			TypeError,
			debug(nonTA) + ' is not an Integer-Indexed Exotic object'
		);
	});

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (typedArray) {
			var isBigInt = esV.isBigIntTAType(typedArray);
			if (!isBigInt || extras.getAO('ToBigInt')) {
				var Z = isBigInt ? safeBigInt : Number;
				var TA = global[typedArray];

				var arr = new TA([Z(1), Z(2), Z(3)]);
				st.equal(IntegerIndexedElementGet(arr, 0), Z(1), 'returns index 0');
				st.equal(IntegerIndexedElementGet(arr, 1), Z(2), 'returns index 1');
				st.equal(IntegerIndexedElementGet(arr, 2), Z(3), 'returns index 2');
			}
		});

		st.end();
	});
};
