'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberMultiply) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberMultiply(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberMultiply(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	forEach([+0, -0, 1, -1], function (x) {
		var expected = x === 0 ? NaN : Infinity;
		t.equal(NumberMultiply(Infinity, x), expected, '+∞ * ' + debug(x) + ' is ' + debug(expected));
		t.equal(NumberMultiply(x, Infinity), expected, debug(x) + ' * +∞ is ' + debug(expected));
		t.equal(NumberMultiply(-Infinity, x), -expected, '-∞ * ' + debug(x) + ' is ' + debug(expected));
		t.equal(NumberMultiply(x, -Infinity), -expected, debug(x) + ' * -∞ is ' + debug(expected));
	});

	t.equal(NumberMultiply(Infinity, Infinity), Infinity, '+∞ * +∞ is +∞');
	t.equal(NumberMultiply(Infinity, -Infinity), -Infinity, '+∞ * -∞ is -∞');
	t.equal(NumberMultiply(-Infinity, Infinity), -Infinity, '-∞ * +∞ is -∞');
	t.equal(NumberMultiply(-Infinity, -Infinity), Infinity, '-∞ * -∞ is +∞');

	t.equal(NumberMultiply(+0, +0), +0, '0 * 0 is +0');
	t.equal(NumberMultiply(+0, -0), -0, '0 * -0 is -0');
	t.equal(NumberMultiply(-0, +0), -0, '-0 * 0 is -0');
	t.equal(NumberMultiply(-0, -0), +0, '-0 * -0 is +0');

	forEach([].concat(
		v.numbers,
		NaN
	), function (number) {
		t.equal(NumberMultiply(NaN, number), NaN, 'NaN * ' + debug(number) + ' is NaN');
		t.equal(NumberMultiply(number, NaN), NaN, debug(number) + ' * NaN is NaN');

		if (number !== 0 && isFinite(number)) {
			t.equal(NumberMultiply(number, 0), number > 0 ? 0 : -0, debug(number) + ' * +0 produces ' + (number > 0 ? '+0' : '-0'));
			t.equal(NumberMultiply(0, number), number > 0 ? 0 : -0, '+0 * ' + debug(number) + ' produces ' + (number > 0 ? '+0' : '-0'));
			t.equal(NumberMultiply(number, -0), number > 0 ? -0 : 0, debug(number) + ' * -0 produces ' + (number > 0 ? '-0' : '+0'));
			t.equal(NumberMultiply(-0, number), number > 0 ? -0 : 0, '-0 * ' + debug(number) + ' produces ' + (number > 0 ? '-0' : '+0'));
			t.equal(NumberMultiply(number, 1), number, debug(number) + ' * 1 produces itself');
			t.equal(NumberMultiply(number, -42), number * -42, debug(number) + ' * -42 produces ' + (number - 42));
		}
	});
};
