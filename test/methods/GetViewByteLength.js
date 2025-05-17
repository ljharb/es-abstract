'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, GetViewByteLength, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');
	var MakeDataViewWithBufferWitnessRecord = extras.getAO('MakeDataViewWithBufferWitnessRecord');

	forEach(esV.unknowns, function (nonDVWBWRecord) {
		t['throws'](
			function () { GetViewByteLength(nonDVWBWRecord); },
			TypeError,
			debug(nonDVWBWRecord) + ' is not a Data View With Buffer Witness Record'
		);
	});

	t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
		var ab = new ArrayBuffer(8);
		var dv = new DataView(ab);

		var record = MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED');

		st.equal(GetViewByteLength(record), 8, 'non-auto byte length returns it');

		// TODO: actual DV byteLength auto, but not fixed length? (may not be possible)

		st.test(
			'non-fixed length AB, return byteLength - byteOffset',
			{ skip: !('resizable' in ArrayBuffer.prototype) },
			function (s2t) {
				var rab = new ArrayBuffer(12, { maxByteLength: 64 });
				var rdv = new DataView(rab, 8);

				record = MakeDataViewWithBufferWitnessRecord(rdv, 'UNORDERED');

				s2t.equal(GetViewByteLength(record), 4, 'non-auto byte length returns it minus the offset');

				s2t.end();
			}
		);

		st.test(
			'non-fixed length SAB, return byteLength - byteOffset',
			{ skip: typeof SharedArrayBuffer !== 'function' || !('growable' in SharedArrayBuffer.prototype) },
			function (s2t) {
				var rsab = new SharedArrayBuffer(12, { maxByteLength: 64 });
				var rsdv = new DataView(rsab, 8);

				record = MakeDataViewWithBufferWitnessRecord(rsdv, 'UNORDERED');

				s2t.equal(GetViewByteLength(record), 4, 'non-auto byte length returns it minus the offset');

				s2t.end();
			}
		);

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			var dab = new ArrayBuffer(1);
			var ddv = new DataView(dab);

			var ndRecord = MakeDataViewWithBufferWitnessRecord(ddv, 'UNORDERED');
			DetachArrayBuffer(dab);

			s2t['throws'](
				function () { GetViewByteLength(ndRecord); },
				TypeError,
				'non-fixed view, detached buffer, non-detached record, throws inside IsViewOutOfBounds'
			);

			ndRecord = MakeDataViewWithBufferWitnessRecord(ddv, 'UNORDERED'); // reflect detachment

			s2t['throws'](
				function () { GetViewByteLength(ndRecord); },
				TypeError,
				'non-fixed view, detached buffer, detached record, throws inside IsViewOutOfBounds'
			);

			s2t.test(
				'AB non-fixed length, detached -> throws',
				{ skip: !('resizable' in ArrayBuffer.prototype) },
				function (s3t) {
					var rab = new ArrayBuffer(12, { maxByteLength: 64 });
					var rdv = new DataView(rab, 8);

					record = MakeDataViewWithBufferWitnessRecord(rdv, 'UNORDERED');

					DetachArrayBuffer(rab);

					s3t['throws'](
						function () { GetViewByteLength(record); },
						TypeError,
						'detached RAB with non-detached DVBWR throws'
					);

					record = MakeDataViewWithBufferWitnessRecord(rdv, 'UNORDERED');
					s3t['throws'](
						function () { GetViewByteLength(record); },
						TypeError,
						'detached RAB with detached DVBWR throws'
					);

					s3t.end();
				}
			);

			s2t.end();
		});

		st.end();
	});
};
