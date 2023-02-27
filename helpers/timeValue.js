'use strict';

var $DateGetTime = require('call-bound')('Date.prototype.getTime');

/** @type {(x: Date) => number} */
module.exports = function timeValue(x) {
	return $DateGetTime(x);
};
