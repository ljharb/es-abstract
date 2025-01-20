'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberExponentiate) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberExponentiate(nonNumber, 0); },
			TypeError,
			'base: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberExponentiate(0, nonNumber); },
			TypeError,
			'exponent: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberExponentiate(0, 42), 0, '+0 ** 42 is +0');
	t.equal(NumberExponentiate(0, -42), Infinity, '+0 ** 42 is +∞');
	t.equal(NumberExponentiate(-0, 42), 0, '-0 ** 42 is +0');
	t.equal(NumberExponentiate(-0, 41), -0, '-0 ** 41 is -0');
	t.equal(NumberExponentiate(-0, -42), Infinity, '-0 ** 42 is +∞');
	t.equal(NumberExponentiate(-0, -41), -Infinity, '-0 ** 41 is -∞');

	t.equal(NumberExponentiate(Infinity, 0), 1, '+∞ ** 0 is 1');
	t.equal(NumberExponentiate(Infinity, -0), 1, '+∞ ** -0 is 1');
	t.equal(NumberExponentiate(-Infinity, 0), 1, '-∞ ** 0 is 1');
	t.equal(NumberExponentiate(-Infinity, -0), 1, '-∞ ** -0 is 1');

	t.equal(NumberExponentiate(Infinity, 1), Infinity, '+∞ ** 1 is +∞');
	t.equal(NumberExponentiate(Infinity, 2), Infinity, '+∞ ** 2 is +∞');
	t.equal(NumberExponentiate(Infinity, -1), +0, '+∞ ** -1 is +0');
	t.equal(NumberExponentiate(Infinity, -2), +0, '+∞ ** -2 is +0');

	t.equal(NumberExponentiate(-Infinity, 1), -Infinity, '-∞ ** 1 is -∞');
	t.equal(NumberExponentiate(-Infinity, 2), Infinity, '-∞ ** 2 is +∞');
	t.equal(NumberExponentiate(-Infinity, -1), -0, '-∞ ** --1 is -0');
	t.equal(NumberExponentiate(-Infinity, -2), +0, '-∞ ** --2 is +0');

	t.equal(NumberExponentiate(1.1, Infinity), Infinity, '1.1 ** +∞ is +∞');
	t.equal(NumberExponentiate(1.1, -Infinity), 0, '1.1 ** -∞ is +0');
	t.equal(NumberExponentiate(-1.1, Infinity), Infinity, '-1.1 ** +∞ is +∞');
	t.equal(NumberExponentiate(-1.1, -Infinity), 0, '-1.1 ** -∞ is +0');

	t.equal(NumberExponentiate(1, Infinity), NaN, '1 ** +∞ is NaN');
	t.equal(NumberExponentiate(1, -Infinity), NaN, '1 ** -∞ is NaN');
	t.equal(NumberExponentiate(-1, Infinity), NaN, '-1 ** +∞ is NaN');
	t.equal(NumberExponentiate(-1, -Infinity), NaN, '-1 ** -∞ is NaN');

	t.equal(NumberExponentiate(0.9, Infinity), 0, '0.9 ** +∞ is +0');
	t.equal(NumberExponentiate(0.9, -Infinity), Infinity, '0.9 ** -∞ is ∞');
	t.equal(NumberExponentiate(-0.9, Infinity), 0, '-0.9 ** +∞ is +0');
	t.equal(NumberExponentiate(-0.9, -Infinity), Infinity, '-0.9 ** -∞ is +∞');

	forEach([].concat(
		v.numbers,
		NaN
	), function (number) {
		t.equal(NumberExponentiate(number, NaN), NaN, debug(number) + ' ** NaN is NaN');

		if (number !== 0) {
			t.equal(NumberExponentiate(number, 0), 1, debug(number) + ' ** +0 is 1');
			t.equal(NumberExponentiate(number, -0), 1, debug(number) + ' ** -0 is 1');
			t.equal(NumberExponentiate(NaN, number), NaN, 'NaN ** ' + debug(number) + ' is NaN');
		}
	});
};
