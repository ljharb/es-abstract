'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, ToZeroPaddedDecimalString) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.notNonNegativeIntegers, function (notNonNegativeInteger) {
		t['throws'](
			function () { ToZeroPaddedDecimalString(notNonNegativeInteger); },
			RangeError,
			debug(notNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	t.equal(ToZeroPaddedDecimalString(1, 1), '1');
	t.equal(ToZeroPaddedDecimalString(1, 2), '01');
	t.equal(ToZeroPaddedDecimalString(1, 3), '001');
};
