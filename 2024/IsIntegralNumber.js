// @ts-nocheck

'use strict';

var truncate = require('./truncate');

var $isFinite = require('math-intrinsics/isFinite');

// https://262.ecma-international.org/14.0/#sec-isintegralnumber

/** @type {(argument: unknown) => boolean} */
module.exports = function IsIntegralNumber(argument) {
	if (typeof argument !== 'number' || !$isFinite(argument)) {
		return false;
	}
	return truncate(argument) === argument;
};
