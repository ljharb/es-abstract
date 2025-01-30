'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var typedArrayBuffer = require('typed-array-buffer');
var v = require('es-value-fixtures');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'ValidateIntegerTypedArray'>} */
module.exports = function (t, year, actual) {
	t.ok(year >= 2021, 'ES2021+');

	var ValidateIntegerTypedArray = year >= 2024
		? /** @type {import('../testHelpers').AOOnlyYears<'ValidateIntegerTypedArray', 2024>} */ (actual)
		: /** @type {import('../testHelpers').AOOnlyYears<'ValidateIntegerTypedArray', 2024>} */ function ValidateIntegerTypedArray(typedArray, waitable) {
			if (arguments.length > 1) {
				/** @type {import('../testHelpers').AOOnlyYears<'ValidateIntegerTypedArray', Exclude<import('../testHelpers').TestYear, 2024>>} */ (actual)(typedArray, waitable);
			} else {
				/** @type {import('../testHelpers').AOOnlyYears<'ValidateIntegerTypedArray', Exclude<import('../testHelpers').TestYear, 2024>>} */ (actual)(typedArray);
			}
			return {
				'[[Object]]': typedArray,
				'[[CachedBufferByteLength]]': typedArray.buffer.byteLength
			};
		};

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { ValidateIntegerTypedArray(null, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(/** @type {unknown[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		esV.unknowns,
		[[]]
	)), function (nonTA) {
		t['throws'](
			// @ts-expect-error
			function () { ValidateIntegerTypedArray(nonTA, false); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	/** @param {import('../../types').TypedArrayWithBufferWitnessRecord | import('../../types').TypedArray} tawbr */
	var unwrap = function unwrap(tawbr) {
		return year >= 2024 ? typedArrayBuffer(/** @type {import('../../types').TypedArrayWithBufferWitnessRecord} */ (tawbr)['[[Object]]']) : tawbr;
	};

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (TypedArray) {
			var ta = new global[TypedArray](0);
			var shouldThrow = TypedArray.indexOf('Clamped') > -1 || !(/Int|Uint/).test(TypedArray);
			if (shouldThrow) {
				st['throws'](
					function () { ValidateIntegerTypedArray(ta, false); },
					TypeError,
					debug(ta) + ' is not an integer TypedArray'
				);
				if (year < 2024) {
					st['throws'](
						function () { ValidateIntegerTypedArray(ta, false); },
						TypeError,
						debug(ta) + ' is not an integer TypedArray'
					);
				}
			} else {
				st.doesNotThrow(
					function () { ValidateIntegerTypedArray(ta, false); },
					debug(ta) + ' is an integer TypedArray'
				);
				st.equal(
					unwrap(ValidateIntegerTypedArray(ta, false)),
					ta.buffer,
					'returns the buffer of a waitable integer TypedArray'
				);
				if (year < 2024) {
					st.equal(
						unwrap(ValidateIntegerTypedArray(ta, false)),
						ta.buffer,
						'returns the buffer of a waitable integer TypedArray'
					);
				}
			}

			var isWaitable = TypedArray === 'Int32Array' || TypedArray === 'BigInt64Array';
			if (isWaitable) {
				st.doesNotThrow(
					function () { ValidateIntegerTypedArray(ta, true); },
					debug(ta) + ' is a waitable integer TypedArray'
				);
				st.equal(
					unwrap(ValidateIntegerTypedArray(ta, true)),
					ta.buffer,
					'returns the buffer of a waitable integer TypedArray'
				);
			} else {
				st['throws'](
					function () { ValidateIntegerTypedArray(ta, true); },
					TypeError,
					debug(ta) + ' is not a waitable integer TypedArray'
				);
			}
		});

		st.end();
	});
};
