'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, truncate) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { truncate(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a number'
		);
	});

	t.equal(truncate(-1.1), -1, '-1.1 truncates to -1');
	t.equal(truncate(1.1), 1, '1.1 truncates to 1');
	t.equal(truncate(0), 0, '+0 truncates to +0');
	t.equal(truncate(-0), 0, '-0 truncates to +0');

	t.test('has bigints', { skip: v.bigints.length === 0 }, function (st) {
		// BigInt support: integer-valued, so truncate is the identity, and
		// arbitrarily-large values are preserved without precision loss.
		st.equal(truncate(BigInt(0)), BigInt(0), '0n is unchanged');
		st.equal(truncate(BigInt(5)), BigInt(5), '5n is unchanged');
		st.equal(truncate(BigInt(-5)), BigInt(-5), '-5n is unchanged');
		st.equal(
			truncate(BigInt('123456789012345678901234567890')),
			BigInt('123456789012345678901234567890'),
			'arbitrary-precision BigInt is preserved'
		);
		st.equal(
			truncate(BigInt('-123456789012345678901234567890')),
			BigInt('-123456789012345678901234567890'),
			'arbitrary-precision negative BigInt is preserved'
		);

		st.end();
	});
};
