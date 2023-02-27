'use strict';

var IsInteger = require('./IsInteger');

// https://262.ecma-international.org/11.0/#sec-isnonnegativeinteger

/** @type {(argument: unknown) => argument is import('../types').nonNegativeInteger} */
module.exports = function IsNonNegativeInteger(argument) {
	return !!IsInteger(argument) && argument >= 0;
};
