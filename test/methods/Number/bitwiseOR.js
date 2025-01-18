'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../../testHelpers').MethodTest<'Number::bitwiseOR'>} */
module.exports = function (t, year, NumberBitwiseOR) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberBitwiseOR(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			// @ts-expect-error
			function () { NumberBitwiseOR(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	t.equal(NumberBitwiseOR(1, 2), 1 | 2);
};
