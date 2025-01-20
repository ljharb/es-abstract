'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, TimeString) {
	t.ok(year >= 2018, 'ES2018+');

	forEach([].concat(
		v.nonNumbers,
		NaN
	), function (nonNumberOrNaN) {
		t['throws'](
			function () { TimeString(nonNumberOrNaN); },
			TypeError,
			debug(nonNumberOrNaN) + ' is not a non-NaN Number'
		);
	});

	var tv = Date.UTC(2019, 8, 10, 7, 8, 9);
	t.equal(TimeString(tv), '07:08:09 GMT');
};
