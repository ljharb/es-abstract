'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, BinaryOr) {
	t.ok(year >= 2020, 'ES2020+');

	t.equal(BinaryOr(0, 0), 0);
	t.equal(BinaryOr(0, 1), 1);
	t.equal(BinaryOr(1, 0), 1);
	t.equal(BinaryOr(1, 1), 1);

	forEach([].concat(
		v.nonIntegerNumbers,
		v.nonNumberPrimitives,
		v.objects
	), function (nonBit) {
		t['throws'](
			function () { BinaryOr(0, nonBit); },
			TypeError
		);
		t['throws'](
			function () { BinaryOr(nonBit, 1); },
			TypeError
		);
	});
};
