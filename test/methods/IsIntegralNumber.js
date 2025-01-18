'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsIntegralNumber'>} */
module.exports = function (t, year, IsIntegralNumber) {
	t.ok(year >= 2015, 'ES2015+');

	for (var i = -100; i < 100; i += 10) {
		t.equal(true, IsIntegralNumber(i), i + ' is integer');
		t.equal(false, IsIntegralNumber(i + 0.2), (i + 0.2) + ' is not integer');
	}
	t.equal(true, IsIntegralNumber(-0), '-0 is integer');
	forEach(esV.notInts, function (notInt) {
		t.equal(false, IsIntegralNumber(notInt), debug(notInt) + ' is not integer');
	});
	t.equal(false, IsIntegralNumber(v.uncoercibleObject), 'uncoercibleObject is not integer');
};
