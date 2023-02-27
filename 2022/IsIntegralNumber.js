// @ts-nocheck

'use strict';

var isInteger = require('math-intrinsics/isInteger');

// https://262.ecma-international.org/12.0/#sec-isinteger

/** @type {typeof isInteger} */
module.exports = function IsIntegralNumber(argument) {
	return isInteger(argument);
};
