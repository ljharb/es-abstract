'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, ToIntegerOrInfinity) {
	t.ok(year >= 2021, 'ES2021+');

	forEach([0, -0, NaN], function (num) {
		t.equal(ToIntegerOrInfinity(num), +0, debug(num) + ' returns +0');
	});

	forEach([Infinity, 42], function (num) {
		t.equal(ToIntegerOrInfinity(num), num, debug(num) + ' returns itself');
		t.equal(ToIntegerOrInfinity(-num), -num, '-' + debug(num) + ' returns itself');
	});

	t.equal(ToIntegerOrInfinity(Math.PI), 3, 'pi returns 3');
	t.equal(ToIntegerOrInfinity(-0.1), +0, '-0.1 truncates to +0, not -0');

	t['throws'](
		function () { return ToIntegerOrInfinity(v.uncoercibleObject); },
		TypeError,
		'uncoercibleObject throws'
	);
};
