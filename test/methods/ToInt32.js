'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'ToInt32'>} */
module.exports = function (t, year, ToInt32, extras) {
	t.ok(year >= 5, 'ES5+');

	t.equal(ToInt32(NaN), 0, 'NaN coerces to +0');

	forEach(/** @type {number[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.zeroes,
		v.infinities
	)), function (num) {
		t.equal(ToInt32(num), 0, num + ' returns +0');
		t.equal(ToInt32(-num), 0, '-' + num + ' returns +0');
	});

	t['throws'](
		function () { return ToInt32(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);

	t.equal(ToInt32(0x100000000), 0, '2^32 returns +0');
	t.equal(ToInt32(0x100000000 - 1), -1, '2^32 - 1 returns -1');
	t.equal(ToInt32(0x80000000), -0x80000000, '2^31 returns -2^31');
	t.equal(ToInt32(0x80000000 - 1), 0x80000000 - 1, '2^31 - 1 returns 2^31 - 1');

	var ToUint32 = extras.getAO('ToUint32');

	forEach([
		0,
		Infinity,
		NaN,
		0x100000000,
		0x80000000,
		0x10000,
		0x42
	], function (num) {
		t.equal(ToInt32(num), ToInt32(ToUint32(num)), 'ToInt32(x) === ToInt32(ToUint32(x)) for 0x' + num.toString(16));
		t.equal(ToInt32(-num), ToInt32(ToUint32(-num)), 'ToInt32(x) === ToInt32(ToUint32(x)) for -0x' + num.toString(16));
	});
};
