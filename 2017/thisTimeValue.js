// @ts-nocheck

'use strict';

var timeValue = require('../helpers/timeValue');

// https://262.ecma-international.org/6.0/#sec-properties-of-the-date-prototype-object

/** @type {(value: Date) => number} */
module.exports = function thisTimeValue(value) {
	return timeValue(value);
};
