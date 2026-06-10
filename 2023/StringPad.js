'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

var ToLength = require('./ToLength');
var ToString = require('./ToString');

var specEnum = require('../helpers/specEnum');

var $strSlice = callBound('String.prototype.slice');

var year = require('./year');

var START = specEnum(year, 'start');
var END = specEnum(year, 'end');

// https://262.ecma-international.org/11.0/#sec-stringpad

module.exports = function StringPad(O, maxLength, fillString, placement) {
	if (placement !== START && placement !== END) {
		throw new $TypeError('Assertion failed: `placement` must be `' + START + '` or `' + END + '`');
	}
	var S = ToString(O);
	var intMaxLength = ToLength(maxLength);
	var stringLength = S.length;
	if (intMaxLength <= stringLength) {
		return S;
	}
	var filler = typeof fillString === 'undefined' ? ' ' : ToString(fillString);
	if (filler === '') {
		return S;
	}
	var fillLen = intMaxLength - stringLength;

	// the String value consisting of repeated concatenations of filler truncated to length fillLen.
	var truncatedStringFiller = '';
	while (truncatedStringFiller.length < fillLen) {
		truncatedStringFiller += filler;
	}
	truncatedStringFiller = $strSlice(truncatedStringFiller, 0, fillLen);

	if (placement === START) {
		return truncatedStringFiller + S;
	}
	return S + truncatedStringFiller;
};
