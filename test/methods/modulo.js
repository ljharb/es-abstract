'use strict';

var esV = require('../helpers/v');

module.exports = function (t, year, modulo) {
	t.ok(year >= 5, 'ES5+');

	t.equal(3 % 2, 1, '+3 % 2 is +1');
	t.equal(modulo(3, 2), 1, '+3 mod 2 is +1');

	t.equal(-3 % 2, -1, '-3 % 2 is -1');
	t.equal(modulo(-3, 2), 1, '-3 mod 2 is +1');

	if (year >= 2020) {
		t.test('BigInts', { skip: !esV.hasBigInts }, function (st) {
			st.equal(modulo(BigInt(3), BigInt(2)), BigInt(1), '+3n mod +2n is +1n');
			st.equal(modulo(BigInt(-3), BigInt(2)), BigInt(1), '-3n mod +2n is +1n');
			st.equal(modulo(BigInt(3), BigInt(-2)), BigInt(-1), '+3n mod -2n is -1n');
			st.equal(modulo(BigInt(-3), BigInt(-2)), BigInt(-1), '-3n mod -2n is -1n');

			st.equal(modulo(BigInt(6), BigInt(3)), BigInt(0), '+6n mod +3n is 0n');
			st.equal(modulo(BigInt(0), BigInt(3)), BigInt(0), '0n mod +3n is 0n');
			st.equal(modulo(BigInt(0), BigInt(-3)), BigInt(0), '0n mod -3n is 0n');

			st['throws'](
				function () { modulo(BigInt(1), 2); },
				TypeError,
				'mixing bigint and number throws'
			);
			st['throws'](
				function () { modulo(1, BigInt(2)); },
				TypeError,
				'mixing number and bigint throws'
			);

			st.end();
		});
	}
};
