'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');

var esV = require('../helpers/v');

module.exports = function (t, year, SameValue) {
	t.ok(year >= 5, 'ES5+');

	t.equal(true, SameValue(NaN, NaN), 'NaN is SameValue as NaN');
	t.equal(false, SameValue(0, -0), '+0 is not SameValue as -0');

	forEach(esV.unknowns, function (val) {
		t.equal(val === val, SameValue(val, val), debug(val) + ' is SameValue to itself');
	});
};
