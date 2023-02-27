'use strict';

var SameValueNonNumeric = require('./SameValueNonNumeric');
var Type = require('./Type');
var BigIntEqual = require('./BigInt/equal');
var NumberEqual = require('./Number/equal');

// https://262.ecma-international.org/13.0/#sec-isstrictlyequal

/** @type {(x: unknown, y: unknown) => boolean} */
module.exports = function IsStrictlyEqual(x, y) {
	if (Type(x) !== Type(y)) {
		return false;
	}
	if (typeof x === 'number' && typeof y === 'number') {
		return NumberEqual(x, y);
	}
	if (typeof x === 'bigint' && typeof y === 'bigint') {
		return BigIntEqual(x, y);
	}

	return SameValueNonNumeric(/** @type {import('../types').NonNumeric} */ (x), /** @type {import('../types').NonNumeric} */ (y));
};
