'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberSubtract) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberSubtract(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberSubtract(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberSubtract(+0, +0), +0, '0 - 0 is +0');
	t.equal(NumberSubtract(+0, -0), +0, '0 - -0 is +0');
	t.equal(NumberSubtract(-0, +0), -0, '-0 - 0 is -0');
	t.equal(NumberSubtract(-0, -0), +0, '-0 - -0 is +0');

	forEach(v.numbers, function (number) {
		if (number !== 0) {
			t.equal(NumberSubtract(number, 0), number, debug(number) + ' - 0 produces ' + number);
		}
		t.equal(NumberSubtract(number, 1), number - 1, debug(number) + ' - 1 produces ' + (number + 1));
		t.equal(NumberSubtract(number, 42), number - 42, debug(number) + ' - 42 produces ' + (number - 42));
	});
};
