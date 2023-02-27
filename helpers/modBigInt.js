'use strict';

/** @type {(BigIntRemainder: (n: bigint, d: bigint) => bigint, bigint: bigint, modulo: bigint) => bigint} */
module.exports = function bigIntMod(BigIntRemainder, bigint, modulo) {
	var remain = BigIntRemainder(bigint, modulo);
	return remain >= 0 ? remain : remain + modulo;
};
