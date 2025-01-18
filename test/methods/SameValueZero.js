'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'SameValueZero'>} */
module.exports = function (t, year, SameValueZero) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(true, SameValueZero(NaN, NaN), 'NaN is SameValueZero as NaN');
	t.equal(true, SameValueZero(0, -0), '+0 is SameValueZero as -0');

	forEach(esV.unknowns, function (val) {
		t.equal(val === val, SameValueZero(val, val), debug(val) + ' is SameValueZero to itself');
	});
};
