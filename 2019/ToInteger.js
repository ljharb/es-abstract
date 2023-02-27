// @ts-nocheck

'use strict';

var ES5ToInteger = require('../5/ToInteger');

var ToNumber = require('./ToNumber');

// https://262.ecma-international.org/6.0/#sec-tointeger

/** @type {(value: unknown) => import('../types').integer} */
module.exports = function ToInteger(value) {
	var number = ToNumber(value);
	return ES5ToInteger(number);
};
