'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberSameValueZero) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberSameValueZero(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberSameValueZero(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberSameValueZero(NaN, NaN), true, 'NaN is the sameValueZero as NaN');

	t.equal(NumberSameValueZero(+0, +0), true, '+0 is sameValueZero as +0');
	t.equal(NumberSameValueZero(+0, -0), true, '+0 is sameValueZero as -0');
	t.equal(NumberSameValueZero(-0, +0), true, '-0 is sameValueZero as +0');
	t.equal(NumberSameValueZero(-0, -0), true, '-0 is sameValueZero as -0');

	forEach(v.numbers, function (number) {
		t.ok(NumberSameValueZero(number, number), debug(number) + ' is the sameValueZero as itself');
	});
};
