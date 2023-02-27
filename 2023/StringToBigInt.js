// @ts-nocheck

'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');

// https://262.ecma-international.org/14.0/#sec-stringtobigint

/** @type {(argument: string) => bigint | undefined} */
module.exports = function StringToBigInt(argument) {
	if (typeof argument !== 'string') {
		throw new $TypeError('`argument` must be a string');
	}
	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}
	try {
		return $BigInt(argument);
	} catch (e) {
		return void undefined;
	}
};
