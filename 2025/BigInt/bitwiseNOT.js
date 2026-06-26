'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-bitwiseNOT

module.exports = function BigIntBitwiseNOT(x) {
	if (typeof x !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` argument must be a BigInt');
	}
	if (!$BigInt) {
		throw new $SyntaxError('BigInt is not supported');
	}
	return -x - $BigInt(1);
};
