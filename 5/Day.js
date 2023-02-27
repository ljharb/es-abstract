'use strict';

var floor = require('./floor');

var msPerDay = require('../helpers/timeConstants').msPerDay;

// https://262.ecma-international.org/5.1/#sec-15.9.1.2

/** @type {(t: number) => import('../types').integer} */
module.exports = function Day(t) {
	return floor(t / msPerDay);
};
