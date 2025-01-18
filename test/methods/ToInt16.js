'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'ToInt16'>} */
module.exports = function (t, year, ToInt16) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(0, ToInt16(NaN), 'NaN coerces to +0');

	forEach([0, Infinity], function (num) {
		t.equal(0, ToInt16(num), num + ' returns +0');
		t.equal(0, ToInt16(-num), '-' + num + ' returns +0');
	});

	t['throws'](
		function () { return ToInt16(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);

	t.equal(ToInt16(0x100000000), 0, '2^32 returns +0');
	t.equal(ToInt16(0x100000000 - 1), -1, '2^32 - 1 returns -1');
	t.equal(ToInt16(0x80000000), 0, '2^31 returns +0');
	t.equal(ToInt16(0x80000000 - 1), -1, '2^31 - 1 returns -1');
	t.equal(ToInt16(0x10000), 0, '2^16 returns +0');
	t.equal(ToInt16(0x10000 - 1), -1, '2^16 - 1 returns -1');
};
