'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, TypedArrayByteLength, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');
	var MakeTypedArrayWithBufferWitnessRecord = extras.getAO('MakeTypedArrayWithBufferWitnessRecord');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTAWBWR) {
		t['throws'](
			function () { TypedArrayByteLength(nonTAWBWR); },
			TypeError,
			debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
		);
	});

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (TypedArray) {
			st.test('Typed Array: ' + TypedArray, function (tat) {
				var TA = global[TypedArray];
				var ta = new TA(8);
				var record = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

				var elementSize = esV.elementSizes['$' + TypedArray];

				tat.equal(TypedArrayByteLength(record), 8 * elementSize, 'fixed length array, returns byteLength');

				var zta = new TA(0);

				var zRecord = MakeTypedArrayWithBufferWitnessRecord(zta, 'UNORDERED');

				tat.equal(TypedArrayByteLength(zRecord), 0, 'fixed zero length array, returns zero');

				tat.test('can detach', { skip: !esV.canDetach }, function (s2t) {
					DetachArrayBuffer(ta.buffer);

					record = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

					s2t.equal(TypedArrayByteLength(record), 0, 'detached returns zero');

					s2t.end();
				});

				// TODO: actual TA byteLength auto, but not fixed length? (may not be possible)

				tat.test('non-fixed length, return length * elementSize', { skip: !('resizable' in ArrayBuffer.prototype) }, function (tast) {
					var ab = new ArrayBuffer(8, { maxByteLength: 64 });
					var rta = new Uint8Array(ab);

					tast.equal(
						TypedArrayByteLength(MakeTypedArrayWithBufferWitnessRecord(rta, 'UNORDERED')),
						8,
						'resizable ArrayBuffer’s Typed Array has expected byteLength'
					);

					tast.end();
				});

				tat.test('non-fixed length, detached returns zero', { skip: !esV.canDetach }, function (tast) {
					var ab = new ArrayBuffer(8, { maxByteLength: 64 });
					var rta = new Uint8Array(ab);

					DetachArrayBuffer(ab);

					tast.equal(
						TypedArrayByteLength(MakeTypedArrayWithBufferWitnessRecord(rta, 'UNORDERED')),
						0,
						'resizable ArrayBuffer’s detached Typed Array returns zero'
					);

					tast.end();
				});
			});
		});
	});
};
