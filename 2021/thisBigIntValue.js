// @ts-nocheck

'use strict';

var callBound = require('call-bound');

var $SyntaxError = require('es-errors/syntax');
var $bigIntValueOf = callBound('BigInt.prototype.valueOf', true);

// https://262.ecma-international.org/11.0/#sec-thisbigintvalue

/** @type {(value: bigint | BigInt) => bigint} */
module.exports = function thisBigIntValue(value) {
	if (typeof value === 'bigint') {
		return value;
	}

	if (!$bigIntValueOf) {
		throw new $SyntaxError('BigInt is not supported');
	}

	return $bigIntValueOf(value);
};
