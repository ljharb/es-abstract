// @ts-nocheck

'use strict';

var ToUint8 = require('./ToUint8');

// https://262.ecma-international.org/6.0/#sec-toint8

/** @type {(argument: unknown) => import('../types').integer} */
module.exports = function ToInt8(argument) {
	var int8bit = ToUint8(argument);
	return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
};
