'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');
var getTypedArrays = require('../helpers/typedArrays');

/** @type {import('../testHelpers').MethodTest<'IntegerIndexedElementGet'>} */
module.exports = function (t, year, IntegerIndexedElementGet, extras) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { IntegerIndexedElementGet(null, nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			// @ts-expect-error
			function () { IntegerIndexedElementGet(nonTA, 0); },
			TypeError,
			debug(nonTA) + ' is not an Integer-Indexed Exotic object'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (typedArray) {
			if (typedArray !== 'Float16Array' || year >= 2024) {
				var isBigInt = esV.isBigIntTAType(typedArray);
				if (!isBigInt || extras.getAO('ToBigInt')) {
					var Z = isBigInt ? /** @type {NonNullable<typeof safeBigInt>} */ (safeBigInt) : Number;
					var TA = global[typedArray];

					var arr = new TA([Z(1), Z(2), Z(3)]);
					st.equal(IntegerIndexedElementGet(arr, 0), Z(1), 'returns index 0');
					st.equal(IntegerIndexedElementGet(arr, 1), Z(2), 'returns index 1');
					st.equal(IntegerIndexedElementGet(arr, 2), Z(3), 'returns index 2');
				}
			}
		});

		st.end();
	});
};
