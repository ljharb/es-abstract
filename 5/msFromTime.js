'use strict';

var modulo = require('./modulo');

var msPerSecond = require('../helpers/timeConstants').msPerSecond;

// https://262.ecma-international.org/5.1/#sec-15.9.1.10

/** @type {((x: number) => import('../types').integer)} */
module.exports = function msFromTime(t) {
	return modulo(t, msPerSecond);
};
