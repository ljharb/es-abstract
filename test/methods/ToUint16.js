'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'ToUint16'>} */
module.exports = function (t, year, ToUint16) {
	t.ok(year >= 5, 'ES5+');

	t.equal(0, ToUint16(NaN), 'NaN coerces to +0');

	forEach([0, Infinity], function (num) {
		t.equal(0, ToUint16(num), num + ' returns +0');
		t.equal(0, ToUint16(-num), '-' + num + ' returns +0');
	});

	t['throws'](
		function () { return ToUint16(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);

	t.equal(ToUint16(0x100000000), 0, '2^32 returns +0');
	t.equal(ToUint16(0x100000000 - 1), 0x10000 - 1, '2^32 - 1 returns 2^16 - 1');
	t.equal(ToUint16(0x80000000), 0, '2^31 returns +0');
	t.equal(ToUint16(0x80000000 - 1), 0x10000 - 1, '2^31 - 1 returns 2^16 - 1');
	t.equal(ToUint16(0x10000), 0, '2^16 returns +0');
	t.equal(ToUint16(0x10000 - 1), 0x10000 - 1, '2^16 - 1 returns 2^16 - 1');
};
