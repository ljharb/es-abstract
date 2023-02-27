'use strict';

var $TypeError = require('es-errors/type');

var BigIntLeftShift = require('./leftShift');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-signedRightShift

/** @type {(x: bigint, y: bigint) => bigint} */
module.exports = function BigIntSignedRightShift(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	return BigIntLeftShift(x, -y);
};
