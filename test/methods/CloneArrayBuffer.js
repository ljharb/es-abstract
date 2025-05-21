'use strict';

var assign = require('object.assign');
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, CloneArrayBuffer, extras) {
	t.ok(year >= 2021, 'ES2021+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(esV.unknowns, function (nonArrayBuffer) {
		t['throws'](
			function () { CloneArrayBuffer(nonArrayBuffer, 0, 0, Object); },
			TypeError,
			debug(nonArrayBuffer) + ' is not an ArrayBuffer'
		);
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		var emptyBuffer = new ArrayBuffer(0);

		forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
			st['throws'](
				function () { CloneArrayBuffer(emptyBuffer, notNonNegativeInteger, 0, ArrayBuffer); },
				TypeError,
				'srcByteOffset: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
			);

			st['throws'](
				function () { CloneArrayBuffer(emptyBuffer, 0, notNonNegativeInteger, ArrayBuffer); },
				TypeError,
				'srcLength: ' + debug(notNonNegativeInteger) + ' is not a non-negative integer'
			);
		});

		// node < 6 lacks Reflect.construct, so `v.nonConstructorFunctions` can't be detected
		forEach([].concat(
			v.nonFunctions,
			typeof Reflect === 'object' ? v.nonConstructorFunctions : []
		), function (nonConstructor) {
			st['throws'](
				function () { CloneArrayBuffer(emptyBuffer, 0, 0, nonConstructor); },
				TypeError,
				debug(nonConstructor) + ' is not a constructor'
			);
		});

		var a = new ArrayBuffer(8);
		var arrA = new Uint8Array(a);
		var eightInts = [1, 2, 3, 4, 5, 6, 7, 8];
		assign(arrA, eightInts);
		st.deepEqual(arrA, new Uint8Array(eightInts), 'initial buffer setup is correct');

		var b = CloneArrayBuffer(a, 1, 4, ArrayBuffer);
		st.notEqual(b, a, 'cloned buffer is !== original buffer');
		var arrB = new Uint8Array(b);
		st.deepEqual(
			arrB,
			new Uint8Array([2, 3, 4, 5]),
			'cloned buffer follows the source byte offset and length'
		);

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			var buffer = new ArrayBuffer(8);
			s2t.equal(DetachArrayBuffer(buffer), null, 'detaching returns null');

			s2t['throws'](
				function () { CloneArrayBuffer(buffer, 0, 0, ArrayBuffer); },
				TypeError,
				'detached buffers throw'
			);

			s2t.end();
		});

		st.end();
	});
};
