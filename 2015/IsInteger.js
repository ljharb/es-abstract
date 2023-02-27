'use strict';

var isInteger = require('math-intrinsics/isInteger');

// https://262.ecma-international.org/6.0/#sec-isinteger

/** @type {(argument: unknown) => argument is import('../types').integer} */
module.exports = function IsInteger(argument) {
	return isInteger(argument);
};
