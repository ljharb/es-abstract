'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, TypedArrayLength, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');
	var MakeTypedArrayWithBufferWitnessRecord = extras.getAO('MakeTypedArrayWithBufferWitnessRecord');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTAWBWR) {
		t['throws'](
			function () { TypedArrayLength(nonTAWBWR); },
			TypeError,
			debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
		);
	});

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (type) {
			st.test('Typed Array: ' + type, function (tat) {
				var TA = global[type];
				var ta = new TA(8);
				var record = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

				tat.equal(TypedArrayLength(record), 8, 'fixed length array, returns byteLength');

				tat.test('can detach', { skip: !esV.canDetach }, function (s2t) {
					DetachArrayBuffer(ta.buffer);

					record = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

					s2t['throws'](
						function () { TypedArrayLength(record); },
						TypeError,
						debug(ta) + ' is a detached TypedArray'
					);

					s2t.end();
				});

				var elementSize = esV.elementSizes['$' + type];

				// TODO: actual TA byteLength auto, but not fixed length? (may not be possible)

				tat.test(
					'non-fixed length, return floor((byteLength - byteOffset) / elementSize)',
					{ skip: !('resizable' in ArrayBuffer.prototype) },
					function (tsat) {
						var rab = new ArrayBuffer(24, { maxByteLength: 64 });
						var arr = new TA(rab, 8);
						record = MakeTypedArrayWithBufferWitnessRecord(arr, 'UNORDERED');

						tsat.equal(
							TypedArrayLength(record),
							Math.floor((24 - 8) / elementSize),
							type + ' + resizable AB: has expected length'
						);

						tsat.end();
					}
				);

				tat.test(
					'non-fixed length, detached throws',
					{ skip: !('resizable' in ArrayBuffer.prototype) || !esV.canDetach },
					function (tsat) {
						var rab = new ArrayBuffer(24, { maxByteLength: 64 });
						var arr = new TA(rab, 8);
						record = MakeTypedArrayWithBufferWitnessRecord(arr, 'UNORDERED');

						DetachArrayBuffer(rab);

						tsat['throws'](
							function () { TypedArrayLength(record); },
							TypeError,
							'detached RAB with a non-detached TAWBR throws'
						);

						record = MakeTypedArrayWithBufferWitnessRecord(arr, 'UNORDERED');
						tsat['throws'](
							function () { TypedArrayLength(record); },
							TypeError,
							'detached RAB with a detached TAWBR throws'
						);

						tsat.end();
					}
				);
			});
		});

		st.end();
	});
};
