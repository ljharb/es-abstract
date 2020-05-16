'use strict';

var hasSymbols = require('has-symbols')();
var callBound = require('../helpers/callBound.js');

var $toStr = callBound('%Object.prototype.toString%');

// http://www.ecma-international.org/ecma-262/5.1/#sec-9.11

module.exports = function IsCallable(argument) {
	// some older engines say that typeof /abc/ === 'function',
	return typeof argument === 'function'
		&& (hasSymbols || $toStr(argument) !== '[object RegExp]');
};
