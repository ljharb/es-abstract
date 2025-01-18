'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'TimeString'>} */
module.exports = function (t, year, TimeString) {
	t.ok(year >= 2018, 'ES2018+');

	forEach(/** @type {(number | typeof v.nonNumbers[number])[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.nonNumbers,
		NaN
	)), function (nonNumberOrNaN) {
		t['throws'](
			// @ts-expect-error
			function () { TimeString(nonNumberOrNaN); },
			TypeError,
			debug(nonNumberOrNaN) + ' is not a non-NaN Number'
		);
	});

	var tv = Date.UTC(2019, 8, 10, 7, 8, 9);
	t.equal(TimeString(tv), '07:08:09 GMT');
};
