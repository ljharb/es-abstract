'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../../testHelpers').MethodTest<'Number::unaryMinus'>} */
module.exports = function (t, year, NumberUnaryMinus) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberUnaryMinus(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberUnaryMinus(NaN), NaN, 'NaN produces NaN');

	forEach(v.numbers, function (number) {
		t.equal(NumberUnaryMinus(number), -number, debug(number) + ' produces -' + debug(number));
	});
};
