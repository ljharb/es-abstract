'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'ArrayBufferByteLength'>} */
module.exports = function (t, year, ArrayBufferByteLength) {
	t.ok(year >= 2024, 'ES2024+');

	var order = /** @type {const} */ ('UNORDERED');

	forEach(esV.unknowns, function (nonAB) {
		t['throws'](
			// @ts-expect-error
			function () { ArrayBufferByteLength(nonAB, order); },
			TypeError,
			debug(nonAB) + ' is not an ArrayBuffer'
		);
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		var ab = new ArrayBuffer(8);
		st['throws'](
			// @ts-expect-error
			function () { ArrayBufferByteLength(ab, 'not a valid order'); },
			TypeError,
			'invalid order enum value throws'
		);

		st.equal(ArrayBufferByteLength(ab, order), 8, 'fixed length ArrayBuffer is fixed length');

		st.end();
	});

	t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
		var sab = new SharedArrayBuffer(1);
		st.equal(ArrayBufferByteLength(sab, order), 1, 'fixed length SharedArrayBuffer is fixed length');

		st.test('growable SABs', { skip: !('grow' in SharedArrayBuffer.prototype) }, function (s2t) {
			var gsab = new SharedArrayBuffer(0, { maxByteLength: 64 });
			s2t.equal(ArrayBufferByteLength(gsab, order), 0, 'growable SharedArrayBuffer has initial length');

			gsab.grow(8);

			s2t.equal(ArrayBufferByteLength(gsab, order), 8, 'growable SharedArrayBuffer has initial length');

			s2t.end();
		});

		st.end();
	});
};
