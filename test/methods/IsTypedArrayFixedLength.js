'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsTypedArrayFixedLength, extras) {
	t.ok(year >= 2025, 'ES2025+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			function () { IsTypedArrayFixedLength(nonTA); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		var ab = new ArrayBuffer(8);
		var ta = new Uint8Array(ab);

		st.equal(IsTypedArrayFixedLength(ta), true, 'TA with fixed length ArrayBuffer is fixed length');

		st.test('non-fixed length, return length * elementSize', { skip: !('resizable' in ArrayBuffer.prototype) }, function (tast) {
			var rab = new ArrayBuffer(8, { maxByteLength: 64 });
			var rta = new Uint8Array(rab);

			tast.equal(IsTypedArrayFixedLength(rta), false, 'resizable ArrayBuffer’s Typed Array is not fixed length');

			var rabP = new ArrayBuffer(4, { maxByteLength: 64 });
			var rtaP = new Int32Array(rabP);

			tast.equal(IsTypedArrayFixedLength(rtaP), false, 'resizable ArrayBuffer’s Typed Array with a smaller length is not fixed length');

			tast.end();
		});

		st.test('non-fixed length, detached returns zero', { skip: !esV.canDetach || !('resizable' in ArrayBuffer.prototype) }, function (tast) {
			var rdab = new ArrayBuffer(8, { maxByteLength: 64 });
			var rta = new Uint8Array(rdab);

			DetachArrayBuffer(rdab);

			tast.equal(IsTypedArrayFixedLength(rta), false, 'resizable ArrayBuffer’s detached Typed Array is not fixed length');

			tast.end();
		});

		st.end();
	});

	t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
		var sab = new SharedArrayBuffer(1);
		var ta = new Uint8Array(sab);

		st.equal(IsTypedArrayFixedLength(ta), true, 'TA with SharedArrayBuffer is fixed length');

		st.test('non-fixed length', { skip: !('resizable' in SharedArrayBuffer.prototype) }, function (sast) {
			var rsabP = new SharedArrayBuffer(4, { maxByteLength: 64 });
			var rtaP = new Int32Array(rsabP);

			sast.equal(IsTypedArrayFixedLength(rtaP), false, 'resizable ArrayBuffer’s Typed Array with a smaller length is not fixed length');

			sast.end();
		});

		st.test('growable SABs', { skip: !('grow' in SharedArrayBuffer.prototype) }, function (s2t) {
			var gsab = new SharedArrayBuffer(0, { maxByteLength: 64 });
			var gta = new Uint8Array(gsab);

			s2t.equal(IsTypedArrayFixedLength(gta), false, 'TA with growable SharedArrayBuffer is not fixed length');

			gsab.grow(8);

			s2t.equal(IsTypedArrayFixedLength(gta), false, 'TA with growable SharedArrayBuffer, grown, is not fixed length');

			s2t.end();
		});

		st.end();
	});
};
