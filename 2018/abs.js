// @ts-nocheck

'use strict';

var $abs = require('math-intrinsics/abs');

// https://262.ecma-international.org/5.1/#sec-5.2

/** @type {(x: number) => number} */
module.exports = function abs(x) {
	return $abs(x);
};
