'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

module.exports = function (t, year, ValidateAtomicAccessOnIntegerTypedArray) {
	t.ok(year >= 2024, 'ES2024+');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTA) {
		t['throws'](
			function () { ValidateAtomicAccessOnIntegerTypedArray(nonTA, 0); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (TypedArray) {
			var ta = new global[TypedArray](8);

			var shouldThrow = TypedArray.indexOf('Clamped') > -1 || !(/Int|Uint/).test(TypedArray);
			var isWaitable = TypedArray === 'Int32Array' || TypedArray === 'BigInt64Array';

			if (shouldThrow) {
				st['throws'](
					function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 0); },
					debug(ta) + ' is not an integer Typed Array'
				);
			} else {
				st.doesNotThrow(
					function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 0); },
					debug(ta) + ' is an integer Typed Array'
				);

				st['throws'](
					function () { ValidateAtomicAccessOnIntegerTypedArray(ta, -1); },
					RangeError, // via ToIndex
					'a requestIndex of -1 is <= 0'
				);
				st['throws'](
					function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 8); },
					RangeError,
					'a requestIndex === length throws'
				);
				st['throws'](
					function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 9); },
					RangeError,
					'a requestIndex > length throws'
				);

				var elementSize = esV.elementSizes['$' + TypedArray];

				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 0), elementSize * 0, TypedArray + ': requestIndex of 0 gives 0');
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 1), elementSize * 1, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 1));
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 2), elementSize * 2, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 2));
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 3), elementSize * 3, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 3));
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 4), elementSize * 4, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 4));
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 5), elementSize * 5, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 5));
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 6), elementSize * 6, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 6));
				st.equal(ValidateAtomicAccessOnIntegerTypedArray(ta, 7), elementSize * 7, TypedArray + ': requestIndex of 1 gives ' + (elementSize * 7));

				forEach(v.nonBooleans, function (nonBoolean) {
					st['throws'](
						function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 0, nonBoolean); },
						TypeError,
						debug(nonBoolean) + ' is not a Boolean'
					);
				});

				if (isWaitable) {
					st.doesNotThrow(
						function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 0, true); },
						debug(ta) + ' is a waitable integer Typed Array'
					);
				} else {
					st['throws'](
						function () { ValidateAtomicAccessOnIntegerTypedArray(ta, 0, true); },
						TypeError,
						debug(ta) + ' is not a waitable integer Typed Array'
					);
				}
			}
		});

		st.end();
	});
};
