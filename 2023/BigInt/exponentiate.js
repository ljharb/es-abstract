'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-exponentiate

module.exports = function BigIntExponentiate(base, exponent) {
	if (typeof base !== 'bigint' || typeof exponent !== 'bigint') {
		throw new $TypeError('Assertion failed: `base` and `exponent` arguments must be BigInts');
	}
	if (exponent < $BigInt(0)) {
		throw new $RangeError('Exponent must be positive');
	}
	if (/* base === $BigInt(0) && */ exponent === $BigInt(0)) {
		return $BigInt(1);
	}

	var result = $BigInt(1);
	var remaining = exponent;
	while (remaining > $BigInt(0)) {
		result *= base;
		--remaining; // eslint-disable-line no-plusplus
	}
	return result;
};
