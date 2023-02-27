// @ts-nocheck

'use strict';

var Day = require('./Day');
var DayFromYear = require('./DayFromYear');
var YearFromTime = require('./YearFromTime');

// https://262.ecma-international.org/5.1/#sec-15.9.1.4

/** @type {(t: number) => import('../types').integer} */
module.exports = function DayWithinYear(t) {
	return Day(t) - DayFromYear(YearFromTime(t));
};
