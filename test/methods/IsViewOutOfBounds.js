'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, IsViewOutOfBounds, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var order = specEnum(year, 'unordered');

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

			var ndRecord = MakeDataViewWithBufferWitnessRecord(ddv, order);

			DetachArrayBuffer(dab);

			s2t['throws'](
				function () { IsViewOutOfBounds(ndRecord); },
				TypeError,
				'detached view with no-detached record throws'
			);

			var dRecord = MakeDataViewWithBufferWitnessRecord(ddv, order);

			s2t.equal(IsViewOutOfBounds(dRecord), true, 'detached view with detached record is out of bounds');

			s2t.end();
		});

		st.test('malformed record: ~DETACHED~ length with non-detached buffer throws', function (s2t) {
			var dv = new DataView(new ArrayBuffer(8));
			var badRecord = {
				'[[Object]]': dv,
				'[[CachedBufferByteLength]]': year >= 2026 ? '~DETACHED~' : specEnum(year, 'detached')
			};
			s2t['throws'](
				function () { IsViewOutOfBounds(badRecord); },
				TypeError,
				'~DETACHED~ length with non-detached buffer throws'
			);
			s2t.end();
		});

		st.test('out-of-bounds returns true', function (s2t) {
			var dv = new DataView(new ArrayBuffer(8)); // byteOffset 0, byteLength 8
			var shrunkRecord = {
				'[[Object]]': dv,
				'[[CachedBufferByteLength]]': 4 // less than DV's actual byteOffsetEnd
			};
			s2t.equal(
				IsViewOutOfBounds(shrunkRecord),
				true,
				'DV byteOffsetEnd > cached bufferByteLength is out-of-bounds'
			);
			s2t.end();
		});

		for (var i = 0; i < 8; i += 1) {
			st.equal(
				IsViewOutOfBounds(MakeDataViewWithBufferWitnessRecord(new DataView(ab, i), order)),
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
				var record = MakeDataViewWithBufferWitnessRecord(dv, order);

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
				var record = MakeDataViewWithBufferWitnessRecord(dv, order);

				DetachArrayBuffer(rab);

				tsat['throws'](
					function () { IsViewOutOfBounds(record); },
					TypeError,
					'detached RAB with a non-detached DVWBR throws'
				);

				record = MakeDataViewWithBufferWitnessRecord(dv, order);
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
