'use strict';

var $DateValueOf = require('call-bind/callBound')('Date.prototype.valueOf');

// https://262.ecma-international.org/6.0/#sec-properties-of-the-date-prototype-object

module.exports = function thisTimeValue(value) {
	return $DateValueOf(value);
};
