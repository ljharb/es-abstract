'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ToDateString'>} */
module.exports = function (t, year, ToDateString) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { ToDateString(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(ToDateString(NaN), 'Invalid Date', 'NaN becomes "Invalid Date"');

	var now = +new Date();
	t.equal(ToDateString(now), String(new Date(now)), 'any timestamp becomes `Date(timestamp)`');
	t.equal(ToDateString(1e10), String(new Date(1e10)), 'any timestamp becomes `Date(timestamp)`');
};
