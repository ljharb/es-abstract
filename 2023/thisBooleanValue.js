// @ts-nocheck

'use strict';

var $BooleanValueOf = require('call-bound')('Boolean.prototype.valueOf');

// https://262.ecma-international.org/6.0/#sec-properties-of-the-boolean-prototype-object

/** @type {(value: boolean | Boolean) => boolean} */
module.exports = function thisBooleanValue(value) {
	if (typeof value === 'boolean') {
		return value;
	}

	return $BooleanValueOf(value);
};
