'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, ToInteger) {
	t.ok(year >= 5 && year <= 2020, 'ES5 - ES2020');

	forEach([].concat(
		NaN,
		year >= 2020 ? [0, -0] : []
	), function (num) {
		t.equal(0, ToInteger(num), debug(num) + ' returns +0');
	});

	forEach([].concat(
		year < 2020 ? v.zeroes : [],
		Infinity,
		42
	), function (num) {
		t.equal(num, ToInteger(num), debug(num) + ' returns itself');
		t.equal(-num, ToInteger(-num), '-' + debug(num) + ' returns itself');
	});

	t.equal(3, ToInteger(Math.PI), 'pi returns 3');

	t['throws'](
		function () { return ToInteger(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);

	t.equal(
		ToInteger(-0.1),
		year >= 2020 ? +0 : -0,
		'-0.1 truncates to +0 in ES2020+, -0 prior'
	);
};
