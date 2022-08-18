'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $RangeError = GetIntrinsic('%RangeError%');
var $TypeError = GetIntrinsic('%TypeError%');

var truncate = require('../truncate');
var Type = require('../Type');

var zero = $BigInt && $BigInt(0);

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-remainder

module.exports = function BigIntRemainder(n, d) {
	if (Type(n) !== 'BigInt' || Type(d) !== 'BigInt') {
		throw new $TypeError('Assertion failed: `n` and `d` arguments must be BigInts');
	}

	if (d === zero) {
		throw new $RangeError('Division by zero');
	}

	if (n === zero) {
		return zero;
	}

	var quotient = n / d;
	var q = truncate(quotient);
	return n - (d * q);
};
