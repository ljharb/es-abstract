'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var safeBigInt = require('safe-bigint');
var v = require('es-value-fixtures');
var $defineProperty = require('es-define-property');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'SetTypedArrayFromArrayLike'>} */
module.exports = function (t, year, SetTypedArrayFromArrayLike, extras) {
	t.ok(year >= 2021, 'ES2021+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(/** @type {unknown[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		esV.unknowns,
		[[]]
	)), function (nonTA) {
		t['throws'](
			// @ts-expect-error
			function () { SetTypedArrayFromArrayLike(nonTA, 0, []); },
			TypeError,
			'target: ' + debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);
	t.test('Typed Array Support', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
			if (notNonNegativeInteger !== Infinity) {
				st['throws'](
					function () { SetTypedArrayFromArrayLike(new Uint8Array(0), notNonNegativeInteger, []); },
					TypeError,
					'targetOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
				);
			}
		});

		st['throws'](
			function () { SetTypedArrayFromArrayLike(new Uint8Array(0), Infinity, []); },
			RangeError,
			'targetOffset: ' + debug(Infinity) + ' is not a finite integer'
		);

		st['throws'](
			function () { SetTypedArrayFromArrayLike(new Uint8Array(0), 0, new Uint8Array(0)); },
			TypeError,
			'source: must not be a TypedArray'
		);

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			var arr = new Uint8Array(0);
			DetachArrayBuffer(arr.buffer);

			s2t['throws'](
				function () { SetTypedArrayFromArrayLike(arr, 0, []); },
				TypeError,
				'target’s buffer must not be detached'
			);

			s2t.end();
		});

		forEach(availableTypedArrays, function (name) {
			var isBigInt = esV.isBigIntTAType(name);
			var Z = isBigInt ? safeBigInt : Number;
			var TA = global[name];

			var ta = new TA([Z(1), Z(2), Z(3)]);

			st['throws'](
				function () { SetTypedArrayFromArrayLike(ta, 3, [Z(10)]); },
				RangeError,
				name + ': out of bounds set attempt throws'
			);

			SetTypedArrayFromArrayLike(ta, 1, [Z(10)]);

			st.deepEqual(ta, new TA([Z(1), Z(10), Z(3)]), name + ': target is updated');
		});

		st.test('getters are supported, and can detach', { skip: !$defineProperty || !esV.canDetach }, function (s2t) {
			if (!$defineProperty) {
				s2t.fail();
				return;
			}
			var ta = new Uint8Array([1, 2, 3]);
			var obj = { length: 1 };
			$defineProperty(obj, '0', { get: function () { DetachArrayBuffer(ta.buffer); return 10; } });

			if (year >= 2023) {
				s2t.doesNotThrow(
					function () { SetTypedArrayFromArrayLike(ta, 1, obj); },
					TypeError,
					'when a Get detaches the buffer, it does not throw'
				);
			} else {
				s2t['throws'](
					function () { SetTypedArrayFromArrayLike(ta, 1, obj); },
					TypeError,
					'when a Get detaches the buffer, it throws'
				);
			}

			s2t.end();
		});

		st.end();
	});
};
