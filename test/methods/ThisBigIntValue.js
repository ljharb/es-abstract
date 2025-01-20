'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, ThisBigIntValue) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('actual BigInts', { skip: !esV.hasBigInts }, function (st) {
		st.equal(ThisBigIntValue(BigInt(42)), BigInt(42));
		st.equal(ThisBigIntValue(Object(BigInt(42))), BigInt(42));

		st.end();
	});

	forEach(v.nonBigInts, function (nonBigInt) {
		t['throws'](
			function () { ThisBigIntValue(nonBigInt); },
			esV.hasBigInts ? TypeError : SyntaxError,
			debug(nonBigInt) + ' is not a BigInt'
		);
	});

};
