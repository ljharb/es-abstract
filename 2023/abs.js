// @ts-nocheck

'use strict';

var $abs = require('math-intrinsics/abs');

// https://262.ecma-international.org/11.0/#eqn-abs

/** @type {import('../types').Abs} */
module.exports = function abs(x) {
	return typeof x === 'bigint' ? BigInt($abs(Number(x))) : $abs(x);
};
