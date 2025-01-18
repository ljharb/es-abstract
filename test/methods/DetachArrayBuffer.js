'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'DetachArrayBuffer'>} */
module.exports = function (t, year, DetachArrayBuffer) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(esV.unknowns, function (nonArrayBuffer) {
		t['throws'](
			// @ts-expect-error
			function () { DetachArrayBuffer(nonArrayBuffer); },
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
				s2t.doesNotThrow(
					function () { return new Float32Array(buffer); },
					'can create a Float32Array from a non-detached ArrayBuffer'
				);

				s2t.equal(DetachArrayBuffer(buffer), null, 'returns null');

				s2t['throws'](
					function () { return new Float32Array(buffer); },
					TypeError,
					'can not create a Float32Array from a now detached ArrayBuffer'
				);

				s2t.doesNotThrow(
					function () { DetachArrayBuffer(buffer); },
					'can call DetachArrayBuffer on an already-detached ArrayBuffer'
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

				s2t['throws'](
					function () { return DetachArrayBuffer(buffer); },
					SyntaxError,
					'env does not support detaching'
				);
			});

			s2t.end();
		});

		st.end();
	});

	if (year >= 2017) {
		t.test('Shared Array Buffers', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
			var sabs = [
				new SharedArrayBuffer(),
				new SharedArrayBuffer(0)
			];

			forEach(sabs, function (sab) {
				st['throws'](
					// @ts-expect-error
					function () { DetachArrayBuffer(sab); },
					TypeError,
					debug(sab) + ' is a SharedArrayBuffer'
				);
			});

			st.end();
		});
	}
};
