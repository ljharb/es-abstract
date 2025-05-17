'use strict';

var esV = require('../helpers/v');

module.exports = function (t, year, abs) {
	t.ok(year >= 5, 'ES5+');

	t.equal(abs(0), 0, '+0 -> +0');
	t.equal(abs(-0), 0, '-0 -> +0');

	t.equal(abs(1), 1, '+1 -> +1');
	t.equal(abs(-1), 1, '-1 -> +1');

	t.equal(abs(NaN), NaN, 'NaN -> NaN');

	if (year >= 2020) {
		t.test('BigInts', { skip: !esV.hasBigInts }, function (st) {
			st.equal(abs(BigInt(0)), BigInt(0), '0n -> 0n');

			st.equal(abs(BigInt(1)), BigInt(1), '+1n -> +1n');
			st.equal(abs(BigInt(-1)), BigInt(1), '-1n -> +1n');

			st.end();
		});
	}
};
