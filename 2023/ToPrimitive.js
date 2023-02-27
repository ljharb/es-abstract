// @ts-nocheck

'use strict';

var toPrimitive = require('es-to-primitive/es2015');

// https://262.ecma-international.org/6.0/#sec-toprimitive

/** @type {(input: unknown, hint?: Parameters<typeof toPrimitive>[1]) => import('../types').primitive} */
module.exports = function ToPrimitive(input) {
	if (arguments.length > 1) {
		return toPrimitive(input, arguments[1]);
	}
	return toPrimitive(input);
};
