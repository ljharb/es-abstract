'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'thisTimeValue'>} */
module.exports = function (t, year, thisTimeValue) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(esV.unknowns, function (nonDate) {
		t['throws'](
			// @ts-expect-error
			function () { thisTimeValue(nonDate); },
			TypeError,
			debug(nonDate) + ' is not a Date'
		);
	});

	forEach(v.timestamps, function (timestamp) {
		var date = new Date(timestamp);

		t.equal(thisTimeValue(date), timestamp, debug(date) + ' is its own thisTimeValue');
	});
};
