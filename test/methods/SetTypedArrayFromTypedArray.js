'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var debug = require('object-inspect');
var forEach = require('for-each');
var safeBigInt = require('safe-bigint');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

module.exports = function (t, year, SetTypedArrayFromTypedArray, extras) {
	t.ok(year >= 2021, 'ES2021+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTA) {
		t['throws'](
			function () { SetTypedArrayFromTypedArray(nonTA, 0, new Uint8Array(0)); },
			TypeError,
			'target: ' + debug(nonTA) + ' is not a TypedArray'
		);

		t['throws'](
			function () { SetTypedArrayFromTypedArray(new Uint8Array(0), 0, nonTA); },
			TypeError,
			'source: ' + debug(nonTA) + ' is not a TypedArray'
		);
	});

	forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
		if (notNonNegativeInteger !== Infinity) {
			t['throws'](
				function () { SetTypedArrayFromTypedArray(new Uint8Array(0), notNonNegativeInteger, new Uint8Array(0)); },
				TypeError,
				'targetOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
			);
		}
	});

	t['throws'](
		function () { SetTypedArrayFromTypedArray(new Uint8Array(0), Infinity, new Uint8Array(0)); },
		RangeError,
		'targetOffset: ' + debug(Infinity) + ' is not a finite integer'
	);

	t.test('can detach', { skip: !esV.canDetach }, function (st) {
		var arr = new Uint8Array(0);
		DetachArrayBuffer(arr.buffer);

		st['throws'](
			function () { SetTypedArrayFromTypedArray(arr, 0, new Uint8Array(0)); },
			TypeError,
			'target’s buffer must not be detached'
		);

		st['throws'](
			function () { SetTypedArrayFromTypedArray(new Uint8Array(0), 0, arr); },
			TypeError,
			'source’s buffer must not be detached'
		);

		st.end();
	});

	forEach(availableTypedArrays, function (name) {
		var isBigInt = esV.isBigIntTAType(name);
		var Z = isBigInt ? safeBigInt : Number;
		var TA = global[name];

		var ta = new TA([Z(1), Z(2), Z(3)]);

		t['throws'](
			function () { SetTypedArrayFromTypedArray(ta, 3, new TA([Z(10)])); },
			RangeError,
			name + ': out of bounds set attempt throws'
		);

		SetTypedArrayFromTypedArray(ta, 1, new TA([Z(10)]));

		t.deepEqual(ta, new TA([Z(1), Z(10), Z(3)]), name + ': target is updated');

		if (!isBigInt) {
			var DiffTA = name === 'Float32Array' ? Float64Array : Float32Array;
			var diffTypeTA = new DiffTA([10]);

			SetTypedArrayFromTypedArray(diffTypeTA, 0, new TA([20]));

			t.deepEqual(diffTypeTA, new DiffTA([20]));
		}
	});

	t.test('mixed content type', { skip: !esV.hasBigInts || typeof BigInt64Array !== 'function' }, function (st) {
		var bta = new BigInt64Array([BigInt(0)]);
		var nta = new Float64Array([0]);

		st['throws'](
			function () { SetTypedArrayFromTypedArray(bta, 0, nta); },
			TypeError,
			'number into bigint throws'
		);

		st['throws'](
			function () { SetTypedArrayFromTypedArray(nta, 0, bta); },
			TypeError,
			'bigint into number throws'
		);

		st.end();
	});

	t.test('different type, same content type', { skip: !esV.hasBigInts || typeof BigInt64Array !== 'function' }, function (st) {
		var bta = new Float32Array([10, 11]);
		SetTypedArrayFromTypedArray(bta, 0, new Float64Array([0, 1]));
		st.deepEqual(bta, new Float32Array([0, 1]));

		var nta = new Float64Array([0, 1]);
		SetTypedArrayFromTypedArray(nta, 0, new Float32Array([10, 11]));
		st.deepEqual(nta, new Float64Array([10, 11]));

		st.end();
	});

	// TODO: add a test where source and target have the same buffer,
	// covering that the AO uses CloneArrayBuffer,
	// presumably so as not to overwrite the source data as the same buffer is written to
};
