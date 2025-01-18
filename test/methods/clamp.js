'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

/** @type {import('../testHelpers').MethodTest<'clamp'>} */
module.exports = function (t, year, clamp) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { clamp(nonNumber, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER); },
			TypeError,
			'argument 1: ' + debug(nonNumber) + ' is not a number'
		);
		t['throws'](
			// @ts-expect-error
			function () { clamp(0, nonNumber, MAX_SAFE_INTEGER); },
			TypeError,
			'argument 2: ' + debug(nonNumber) + ' is not a number'
		);
		t['throws'](
			// @ts-expect-error
			function () { clamp(0, -MAX_SAFE_INTEGER, nonNumber); },
			TypeError,
			'argument 3: ' + debug(nonNumber) + ' is not a number'
		);
	});

	t.equal(clamp(-1, 0, 2), 0, 'clamping -1 between 0 and 2 is 0');
	t.equal(clamp(0, 0, 2), 0, 'clamping 0 between 0 and 2 is 0');
	t.equal(clamp(1, 0, 2), 1, 'clamping 1 between 0 and 2 is 1');
	t.equal(clamp(2, 0, 2), 2, 'clamping 2 between 0 and 2 is 2');
	t.equal(clamp(3, 0, 2), 2, 'clamping 3 between 0 and 2 is 2');
};
