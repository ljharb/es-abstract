'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ThisNumberValue' | 'thisNumberValue'>} */
module.exports = function (t, year, ThisNumberValue) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { ThisNumberValue(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach(v.numbers, function (number) {
		t.equal(ThisNumberValue(number), number, debug(number) + ' is its own ThisNumberValue');
		var obj = Object(number);
		t.equal(ThisNumberValue(obj), number, debug(obj) + ' is the boxed ThisNumberValue');
	});
};
