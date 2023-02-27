// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');

var BigIntEqual = require('./equal');

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-sameValue

/** @type {(x: bigint, y: bigint) => boolean} */
module.exports = function BigIntSameValue(x, y) {
	if (typeof x !== 'bigint' || typeof y !== 'bigint') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be BigInts');
	}

	return BigIntEqual(x, y);
};
