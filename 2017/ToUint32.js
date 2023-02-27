// @ts-nocheck

'use strict';

var ToNumber = require('./ToNumber');

// http://262.ecma-international.org/5.1/#sec-9.6

/** @type {(x: Parameters<typeof ToNumber>[0]) => import('../types').integer} */
module.exports = function ToUint32(x) {
	return ToNumber(x) >>> 0;
};
