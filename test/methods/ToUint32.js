'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'ToUint32'>} */
module.exports = function (t, year, ToUint32, extras) {
	t.ok(year >= 5, 'ES5+');

	t.equal(0, ToUint32(NaN), 'NaN coerces to +0');

	forEach([0, Infinity], function (num) {
		t.equal(0, ToUint32(num), num + ' returns +0');
		t.equal(0, ToUint32(-num), '-' + num + ' returns +0');
	});

	t['throws'](
		function () { return ToUint32(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);

	t.equal(ToUint32(0x100000000), 0, '2^32 returns +0');
	t.equal(ToUint32(0x100000000 - 1), 0x100000000 - 1, '2^32 - 1 returns 2^32 - 1');
	t.equal(ToUint32(0x80000000), 0x80000000, '2^31 returns 2^31');
	t.equal(ToUint32(0x80000000 - 1), 0x80000000 - 1, '2^31 - 1 returns 2^31 - 1');

	var ToInt32 = extras.getAO('ToInt32');

	forEach([
		0,
		Infinity,
		NaN,
		0x100000000,
		0x80000000,
		0x10000,
		0x42
	], function (num) {
		t.equal(ToUint32(num), ToUint32(ToInt32(num)), 'ToUint32(x) === ToUint32(ToInt32(x)) for 0x' + num.toString(16));
		t.equal(ToUint32(-num), ToUint32(ToInt32(-num)), 'ToUint32(x) === ToUint32(ToInt32(x)) for -0x' + num.toString(16));
	});
};
