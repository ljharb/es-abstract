'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, BinaryAnd) {
	t.ok(year >= 2020, 'ES2020+');

	t.equal(BinaryAnd(0, 0), 0);
	t.equal(BinaryAnd(0, 1), 0);
	t.equal(BinaryAnd(1, 0), 0);
	t.equal(BinaryAnd(1, 1), 1);

	forEach([].concat(
		v.nonIntegerNumbers,
		v.nonNumberPrimitives,
		v.objects
	), function (nonBit) {
		t['throws'](
			function () { BinaryAnd(0, nonBit); },
			TypeError
		);
		t['throws'](
			function () { BinaryAnd(nonBit, 1); },
			TypeError
		);
	});
};
