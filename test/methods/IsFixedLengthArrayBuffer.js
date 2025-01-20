'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsFixedLengthArrayBuffer) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonAB) {
		t['throws'](
			function () { IsFixedLengthArrayBuffer(nonAB); },
			TypeError,
			debug(nonAB) + ' is not an ArrayBuffer or SharedArrayBuffer'
		);
	});

	t.test('ArrayBuffers supported', { skip: typeof ArrayBuffer !== 'function' }, function (st) {
		var ab = new ArrayBuffer(1);
		st.equal(IsFixedLengthArrayBuffer(ab), true, 'fixed length ArrayBuffer is fixed length');

		st.end();
	});

	t.test('SharedArrayBuffers supported', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
		var sab = new SharedArrayBuffer(1);
		st.equal(IsFixedLengthArrayBuffer(sab), true, 'fixed length SharedArrayBuffer is fixed length');

		st.end();
	});
};
