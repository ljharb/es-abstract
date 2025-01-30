'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var typedArrayByteLength = require('typed-array-byte-length');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'ValidateAtomicAccess'>} */
module.exports = function (t, year, actual) {
	t.ok(year >= 2017, 'ES2017+');

	/** @param {import('../../types').TypedArray} ta */
	var makeTAWBR = function (ta) {
		return { '[[Object]]': ta, '[[CachedBufferByteLength]]': typedArrayByteLength(ta) };
	};

	var ValidateAtomicAccess = year >= 2024
		? /** @type {import('../testHelpers').AOOnlyYears<'ValidateAtomicAccess', 2024>} */ (actual)
		: /** @type {import('../testHelpers').AOOnlyYears<'ValidateAtomicAccess', 2024>} */ function ValidateAtomicAccess(taRecord, requestIndex) {
			return /** @type {import('../testHelpers').AOOnlyYears<'ValidateAtomicAccess', Exclude<import('../testHelpers').TestYear, 2024>>} */(actual)(
				taRecord['[[Object]]'],
				requestIndex
			);
		};

	forEach(/** @type {unknown[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		esV.unknowns,
		[[]]
	)), function (nonTA) {
		t['throws'](
			// @ts-expect-error
			function () { ValidateAtomicAccess(nonTA, 0); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (TypedArray) {
			var ta = new global[TypedArray](8);

			st.doesNotThrow(
				function () { ValidateAtomicAccess(makeTAWBR(ta), 0); },
				debug(ta) + ' is an integer TypedArray'
			);

			st['throws'](
				function () { ValidateAtomicAccess(makeTAWBR(ta), -1); },
				RangeError, // via ToIndex
				'a requestIndex of -1 is <= 0'
			);
			st['throws'](
				function () { ValidateAtomicAccess(makeTAWBR(ta), 8); },
				RangeError,
				'a requestIndex === length throws'
			);
			st['throws'](
				function () { ValidateAtomicAccess(makeTAWBR(ta), 9); },
				RangeError,
				'a requestIndex > length throws'
			);

			var elementSize = esV.elementSizes[/** @type {`$${typeof TypedArray}`} */ ('$' + TypedArray)];

			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 0),
				(year >= 2021 ? elementSize : 1) * 0,
				TypedArray + ': requestIndex of 0 gives 0'
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 1),
				(year >= 2021 ? elementSize : 1) * 1,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 1)
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 2),
				(year >= 2021 ? elementSize : 1) * 2,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 2)
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 3),
				(year >= 2021 ? elementSize : 1) * 3,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 3)
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 4),
				(year >= 2021 ? elementSize : 1) * 4,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 4)
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 5),
				(year >= 2021 ? elementSize : 1) * 5,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 5)
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 6),
				(year >= 2021 ? elementSize : 1) * 6,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 6)
			);
			st.equal(
				ValidateAtomicAccess(makeTAWBR(ta), 7),
				(year >= 2021 ? elementSize : 1) * 7,
				TypedArray + ': requestIndex of 1 gives ' + ((year >= 2021 ? elementSize : 1) * 7)
			);
		});

		st.end();
	});
};
