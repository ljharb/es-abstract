'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'IsSharedArrayBuffer'>} */
module.exports = function (t, year, IsSharedArrayBuffer) {
	t.ok(year >= 2017, 'ES2017+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { IsSharedArrayBuffer(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	forEach(v.objects, function (nonSAB) {
		t.equal(IsSharedArrayBuffer(nonSAB), false, debug(nonSAB) + ' is not a SharedArrayBuffer');
	});

	t.test('real SABs', { skip: typeof SharedArrayBuffer !== 'function' }, function (st) {
		var sab = new SharedArrayBuffer();
		st.equal(IsSharedArrayBuffer(sab), true, debug(sab) + ' is a SharedArrayBuffer');

		st.end();
	});
};
