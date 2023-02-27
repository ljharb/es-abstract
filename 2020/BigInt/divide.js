'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-divide

/** @type {(x: bigint, y: bigint) => bigint} */
module.exports = function BigIntDivide(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}
	// eslint-disable-next-line no-extra-parens
	if (y === /** @type {NonNullable<typeof $BigInt>} */ ($BigInt)(0)) {
		throw new $RangeError('Division by zero');
	}
	// shortcut for the actual spec mechanics
	return x / y;
};
