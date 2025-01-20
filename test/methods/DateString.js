'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, DateString) {
	t.ok(year >= 2018, 'ES2018+');

	forEach([].concat(
		v.nonNumbers,
		NaN
	), function (nonNumberOrNaN) {
		t['throws'](
			function () { DateString(nonNumberOrNaN); },
			TypeError,
			debug(nonNumberOrNaN) + ' is not a non-NaN Number'
		);
	});

	t.equal(DateString(Date.UTC(2019, 8, 10, 7, 8, 9)), 'Tue Sep 10 2019');
	t.equal(DateString(Date.UTC(2016, 1, 29, 7, 8, 9)), 'Mon Feb 29 2016'); // leap day
};
