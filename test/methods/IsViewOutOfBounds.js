'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsViewOutOfBounds, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');
	var MakeDataViewWithBufferWitnessRecord = extras.getAO('MakeDataViewWithBufferWitnessRecord');

	forEach(esV.unknowns, function (nonDVWBWRecord) {
		t['throws'](
			function () { IsViewOutOfBounds(nonDVWBWRecord); },
			TypeError,
			debug(nonDVWBWRecord) + ' is not a Data View With Buffer Witness Record'
		);
	});

	t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
		var ab = new ArrayBuffer(8);

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			var dab = new ArrayBuffer(1);
			var ddv = new DataView(dab);

			var ndRecord = MakeDataViewWithBufferWitnessRecord(ddv, 'UNORDERED');

			DetachArrayBuffer(dab);

			s2t['throws'](
				function () { IsViewOutOfBounds(ndRecord); },
				TypeError,
				'detached view with no-detached record throws'
			);

			var dRecord = MakeDataViewWithBufferWitnessRecord(ddv, 'UNORDERED');

			s2t.equal(IsViewOutOfBounds(dRecord), true, 'detached view with detached record is out of bounds');

			s2t.end();
		});

		// TODO true for byteOffsetStart > bufferByteLength || byteOffsetEnd > bufferByteLength
		// not sure how to produce these DataViews

		for (var i = 0; i < 8; i += 1) {
			st.equal(
				IsViewOutOfBounds(MakeDataViewWithBufferWitnessRecord(new DataView(ab, i), 'UNORDERED')),
				false,
				'byteOffset ' + i + ' is not out of bounds'
			);
		}

		st.test(
			'non-fixed length, return floor((byteLength - byteOffset) / elementSize)',
			{ skip: !('resizable' in ArrayBuffer.prototype) },
			function (tsat) {
				var rab = new ArrayBuffer(24, { maxByteLength: 64 });
				var dv = new DataView(rab);
				var record = MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED');

				tsat.equal(
					IsViewOutOfBounds(record),
					false,
					'DataView + resizable AB: has expected length'
				);

				tsat.end();
			}
		);

		st.test(
			'non-fixed length, detached throws',
			{ skip: !('resizable' in ArrayBuffer.prototype) || !esV.canDetach },
			function (tsat) {
				var rab = new ArrayBuffer(24, { maxByteLength: 64 });
				var dv = new DataView(rab);
				var record = MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED');

				DetachArrayBuffer(rab);

				tsat['throws'](
					function () { IsViewOutOfBounds(record); },
					TypeError,
					'detached RAB with a non-detached DVWBR throws'
				);

				record = MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED');
				tsat.equal(
					IsViewOutOfBounds(record),
					true,
					'detached RAB with a detached DVWBR is out of bounds'
				);

				tsat.end();
			}
		);
	});
};
