'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsDetachedBuffer, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(esV.unknowns, function (nonArrayBuffer) {
		t['throws'](
			function () { IsDetachedBuffer(nonArrayBuffer); },
			TypeError,
			debug(nonArrayBuffer) + ' is not an ArrayBuffer'
		);
	});

	t.test('ArrayBuffers', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		var buffers = [
			new ArrayBuffer(),
			new ArrayBuffer(0),
			new ArrayBuffer(4),
			new ArrayBuffer(420)
		];

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			forEach(buffers, function (buffer) {
				s2t.equal(IsDetachedBuffer(buffer), false, debug(buffer) + ' is not detached');
				s2t.doesNotThrow(
					function () { return new Float32Array(buffer); },
					'can create a Float32Array from a non-detached ArrayBuffer'
				);

				s2t.equal(DetachArrayBuffer(buffer), null, 'returns null');

				s2t.equal(IsDetachedBuffer(buffer), true, debug(buffer) + ' is now detached');
				s2t['throws'](
					function () { return new Float32Array(buffer); },
					TypeError,
					'can not create a Float32Array from a now detached ArrayBuffer'
				);
			});

			s2t.end();
		});

		// throws SyntaxError in node < 11
		st.test('can not detach', { skip: esV.canDetach }, function (s2t) {
			forEach(buffers, function (buffer) {
				s2t.doesNotThrow(
					function () { return new Float32Array(buffer); },
					'can create a Float32Array from a non-detached ArrayBuffer'
				);

				s2t.equal(IsDetachedBuffer(buffer), false, 'env does not support detaching');
			});

			s2t.end();
		});

		st.end();
	});

	if (year >= 2017) {
		t.test('IsDetachedBuffer (Shared Array Buffers)', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			var sab = new SharedArrayBuffer(1);
			st.equal(IsDetachedBuffer(sab), false, 'a new SharedArrayBuffer is not detached');

			var zsab = new SharedArrayBuffer(0);
			st.equal(IsDetachedBuffer(zsab), false, 'a new zero-length SharedArrayBuffer is not detached');

			st.end();
		});
	}
};
