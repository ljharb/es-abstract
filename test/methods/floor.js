'use strict';

var esV = require('../helpers/v');

module.exports = function (t, year, floor) {
	t.ok(year >= 5, 'ES5+');

	t.equal(floor(3.2), 3, 'floor(3.2) is 3');
	t.equal(floor(-3.2), -4, 'floor(-3.2) is -4');
	t.equal(floor(0), 0, 'floor(+0) is +0');
	t.equal(floor(-0), -0, 'floor(-0) is -0');

	if (year >= 2020) {
		t.test('floor (with BigInts)', { skip: !esV.hasBigInts }, function (st) {
			st.equal(floor(BigInt(3)), BigInt(3), 'floor(3n) is 3n');
			st.equal(floor(BigInt(-3)), BigInt(-3), 'floor(-3n) is -3n');
			st.equal(floor(BigInt(0)), BigInt(0), 'floor(0n) is 0n');

			st.end();
		});
	}
};
