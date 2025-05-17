'use strict';

var assign = require('object.assign');
var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

module.exports = function (t, year, ArrayBufferCopyAndDetach, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var IsDetachedBuffer = extras.getAO('IsDetachedBuffer');

	forEach(esV.unknowns, function (nonAB) {
		t['throws'](
			function () { ArrayBufferCopyAndDetach(nonAB, 0, 'FIXED-LENGTH'); },
			TypeError,
			debug(nonAB) + ' is not an ArrayBuffer or a SharedArrayBuffer'
		);
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		var ab = new Uint8Array([1, 2, 3, 4]).buffer;

		st.test('can not detach', { skip: esV.canDetach }, function (s2t) {
			s2t['throws'](
				function () { ArrayBufferCopyAndDetach(new ArrayBuffer(8), 0, 'FIXED-LENGTH'); },
				SyntaxError,
				'throws a syntax error when it can not detach'
			);

			s2t.end();
		});

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			forEach(v.nonStrings, function (nonString) {
				s2t['throws'](
					function () { ArrayBufferCopyAndDetach(ab, 0, nonString); },
					TypeError,
					debug(nonString) + ' is not a valid preserveResizability value'
				);
			});

			s2t.equal(IsDetachedBuffer(ab), false, 'buffer is not detached');
			var newBuffer = ArrayBufferCopyAndDetach(ab, undefined, 'FIXED-LENGTH');
			s2t.equal(IsDetachedBuffer(ab), true, 'buffer is now detached');
			s2t.deepEqual(new Uint8Array(newBuffer), new Uint8Array([1, 2, 3, 4]), 'new buffer has expected data');

			var newSameBuffer = ArrayBufferCopyAndDetach(newBuffer, 4, 'FIXED-LENGTH');
			s2t.equal(IsDetachedBuffer(newBuffer), true, 'buffer is now detached');
			s2t.deepEqual(new Uint8Array(newSameBuffer), new Uint8Array([1, 2, 3, 4]), 'new buffer has expected data');

			var newSmallerBuffer = ArrayBufferCopyAndDetach(newSameBuffer, 2, 'FIXED-LENGTH');
			s2t.equal(IsDetachedBuffer(newSameBuffer), true, 'buffer is now detached');
			s2t.deepEqual(new Uint8Array(newSmallerBuffer), new Uint8Array([1, 2]), 'new buffer has expected data');

			var newLargerBuffer = ArrayBufferCopyAndDetach(newSmallerBuffer, 4, 'FIXED-LENGTH');
			s2t.equal(IsDetachedBuffer(newSmallerBuffer), true, 'buffer is now detached');
			s2t.deepEqual(new Uint8Array(newLargerBuffer), new Uint8Array([1, 2, 0, 0]), 'new buffer has expected data');

			s2t['throws'](
				function () { ArrayBufferCopyAndDetach(ab, 0, 'FIXED-LENGTH'); },
				TypeError,
				'throws on already-detached buffer'
			);

			s2t.test('resizables', { skip: !('resizable' in ArrayBuffer.prototype) }, function (s3t) {
				var rab = new ArrayBuffer(4, { maxByteLength: 64 });
				assign(new Uint8Array(rab), [1, 2, 3, 4]);

				s3t.equal(IsDetachedBuffer(rab), false, 'buffer is not detached');
				s3t.equal(rab.resizable, true, 'buffer is resizable');
				var newResizableBuffer = ArrayBufferCopyAndDetach(rab, undefined, 'PRESERVE-RESIZABILITY');
				s3t.equal(IsDetachedBuffer(rab), true, 'buffer is now detached');
				s3t.deepEqual(new Uint8Array(newResizableBuffer), new Uint8Array([1, 2, 3, 4]), 'new buffer has expected data');
				s3t.equal(newResizableBuffer.resizable, true, 'new buffer is resizable');

				var newFixedBuffer = ArrayBufferCopyAndDetach(newResizableBuffer, undefined, 'FIXED-LENGTH');
				s3t.equal(IsDetachedBuffer(newResizableBuffer), true, 'buffer is now detached');
				s3t.deepEqual(new Uint8Array(newFixedBuffer), new Uint8Array([1, 2, 3, 4]), 'new buffer has expected data');
				s3t.equal(newFixedBuffer.resizable, false, 'new buffer is not resizable');

				s3t.end();
			});

			s2t.end();
		});

		st.end();
	});

	t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
		var sab = new SharedArrayBuffer(1);

		st['throws'](
			function () { ArrayBufferCopyAndDetach(sab, undefined, 'FIXED-LENGTH'); },
			TypeError,
			debug(sab) + ' is not a non-shared ArrayBuffer'
		);

		st.end();
	});
};
