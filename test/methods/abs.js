'use strict';

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'abs'>} */
module.exports = function (t, year, abs) {
	t.ok(year >= 5, 'ES5+');

	t.equal(abs(0), 0, '+0 -> +0');
	t.equal(abs(-0), 0, '-0 -> +0');

	t.equal(abs(1), 1, '+1 -> +1');
	t.equal(abs(-1), 1, '-1 -> +1');

	t.equal(abs(NaN), NaN, 'NaN -> NaN');

	if (year >= 2020) {
		var abs2020 = /** @type {import('../testHelpers').AOOnlyYears<'abs', 2020 | 2021 | 2022 | 2023 | 2024>} */ (abs);
		t.test('BigInts', { skip: !esV.hasBigInts }, function (st) {
			st.equal(abs2020(BigInt(0)), BigInt(0), '0n -> 0n');
			st.equal(abs2020(BigInt(1)), BigInt(1), '+1n -> +1n');
			st.equal(abs2020(BigInt(-1)), BigInt(1), '-1n -> +1n');

			st.end();
		});
	}
};
