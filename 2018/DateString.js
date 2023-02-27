'use strict';

var $TypeError = require('es-errors/type');

var weekdays = /** @type {const} */ (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
var months = /** @type {const} */ (['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

var $isNaN = require('math-intrinsics/isNaN');
var padTimeComponent = require('../helpers/padTimeComponent');

var DateFromTime = require('./DateFromTime');
var MonthFromTime = require('./MonthFromTime');
var WeekDay = require('./WeekDay');
var YearFromTime = require('./YearFromTime');

// https://262.ecma-international.org/9.0/#sec-datestring

/** @type {(tv: number) => `${typeof weekdays[number]} ${typeof months[number]} ${string} ${string}`} */
module.exports = function DateString(tv) {
	if (typeof tv !== 'number' || $isNaN(tv)) {
		throw new $TypeError('Assertion failed: `tv` must be a non-NaN Number');
	}
	var weekday = weekdays[WeekDay(tv)];
	var month = months[MonthFromTime(tv)];
	var day = padTimeComponent(DateFromTime(tv));
	var year = padTimeComponent(YearFromTime(tv), 4);

	return /** @type {ReturnType<DateString>} */ (weekday + '\x20' + month + '\x20' + day + '\x20' + year);
};
