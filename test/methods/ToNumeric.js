'use strict';

var debug = require('object-inspect');
var isBigInt = require('is-bigint');

var esV = require('../helpers/v');

var testToNumber = require('./ToNumber');

module.exports = function (t, year, ToNumeric, extras) {
	t.ok(year >= 2020, 'ES2020+');

	testToNumber(
		t,
		year,
		function (x) {
			if (isBigInt(x)) {
				throw new TypeError('replicate ToNumber bigint throwing');
			}
			return ToNumeric(x);
		},
		extras
	);

	t.test('BigInts', { skip: !esV.hasBigInts }, function (st) {
		st.equal(ToNumeric(BigInt(42)), BigInt(42), debug(BigInt(42)) + ' is ' + debug(BigInt(42)));
		st.equal(ToNumeric(Object(BigInt(42))), BigInt(42), debug(Object(BigInt(42))) + ' is ' + debug(BigInt(42)));

		var valueOf = { valueOf: function () { return BigInt(7); } };
		st.equal(ToNumeric(valueOf), valueOf.valueOf(), debug(valueOf) + ' is ' + debug(valueOf.valueOf()));

		var toPrimitive = {};
		var value = BigInt(-2);
		toPrimitive[Symbol.toPrimitive] = function () { return value; };
		st.equal(ToNumeric(toPrimitive), value, debug(toPrimitive) + ' is ' + debug(value));

		st.end();
	});
};
