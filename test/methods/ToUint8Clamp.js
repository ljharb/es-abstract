'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'ToUint8Clamp'>} */
module.exports = function (t, year, ToUint8Clamp) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(0, ToUint8Clamp(NaN), 'NaN coerces to +0');
	t.equal(0, ToUint8Clamp(0), '+0 returns +0');
	t.equal(0, ToUint8Clamp(-0), '-0 returns +0');
	t.equal(0, ToUint8Clamp(-Infinity), '-Infinity returns +0');

	t['throws'](
		function () { return ToUint8Clamp(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);

	forEach([255, 256, 0x100000, Infinity], function (number) {
		t.equal(255, ToUint8Clamp(number), number + ' coerces to 255');
	});

	t.equal(1, ToUint8Clamp(1.49), '1.49 coerces to 1');
	t.equal(2, ToUint8Clamp(1.5), '1.5 coerces to 2, because 2 is even');
	t.equal(2, ToUint8Clamp(1.51), '1.51 coerces to 2');

	t.equal(2, ToUint8Clamp(2.49), '2.49 coerces to 2');
	t.equal(2, ToUint8Clamp(2.5), '2.5 coerces to 2, because 2 is even');
	t.equal(3, ToUint8Clamp(2.51), '2.51 coerces to 3');

	t.equal(ToUint8Clamp(0.75), 1, '0.75 coerces to 1');
};
