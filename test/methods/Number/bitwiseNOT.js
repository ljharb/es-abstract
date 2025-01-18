'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../../testHelpers').MethodTest<'Number::bitwiseNOT'>} */
module.exports = function (t, year, NumberBitwiseNOT) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberBitwiseNOT(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach(v.int32s, function (int32) {
		t.equal(NumberBitwiseNOT(int32), ~int32, debug(int32) + ' becomes ~' + debug(int32));
	});
};
