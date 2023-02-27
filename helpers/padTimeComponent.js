'use strict';

var callBound = require('call-bound');

var $strSlice = callBound('String.prototype.slice');

/** @type {(c: number, count?: number) => string} */
module.exports = function padTimeComponent(c, count) {
	return $strSlice('00' + c, -(count || 2));
};
