// @ts-nocheck

'use strict';

var SameValueNonNumber = require('./SameValueNonNumber');
var Type = require('./Type');
var NumberEqual = require('./Number/equal');

// https://262.ecma-international.org/14.0/#sec-isstrictlyequal

/** @type {(x: unknown, y: unknown) => boolean} */
module.exports = function IsStrictlyEqual(x, y) {
	if (Type(x) !== Type(y)) {
		return false;
	}
	return typeof x === 'number' && typeof y === 'number'
		? NumberEqual(x, y)
		: SameValueNonNumber(/** @type {import('../types').NonNumeric | bigint} */ (x), /** @type {import('../types').NonNumeric | bigint} */ (y));
};
