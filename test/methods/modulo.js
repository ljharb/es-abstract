'use strict';

/** @type {import('../testHelpers').MethodTest<'modulo'>} */
module.exports = function (t, year, modulo) {
	t.ok(year >= 5, 'ES5+');

	t.equal(3 % 2, 1, '+3 % 2 is +1');
	t.equal(modulo(3, 2), 1, '+3 mod 2 is +1');

	t.equal(-3 % 2, -1, '-3 % 2 is -1');
	t.equal(modulo(-3, 2), 1, '-3 mod 2 is +1');
};
