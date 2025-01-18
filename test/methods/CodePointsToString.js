'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'CodePointsToString'>} */
module.exports = function (t, year, CodePointsToString) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { CodePointsToString(nonArray); },
			TypeError,
			debug(nonArray) + ' is not an Array of Code Points'
		);
	});

	forEach(/** @type {(typeof v.notNonNegativeIntegers[number] | number)[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.notNonNegativeIntegers,
		0x10FFFF + 1
	)), function (nonCodePoint) {
		t['throws'](
			function () { CodePointsToString([nonCodePoint]); },
			TypeError,
			debug(nonCodePoint) + ' is not a Code Point'
		);
	});

	t.equal(CodePointsToString([0xD83D, 0xDCA9]), esV.poo.whole, 'code points are converted to a string');
};
