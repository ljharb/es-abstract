'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bound');
var isInteger = require('math-intrinsics/isInteger');

var specEnum = require('../helpers/specEnum');

var $strSlice = callBound('String.prototype.slice');

var year = require('./year');

var START = specEnum(year, 'start');
var END = specEnum(year, 'end');

// https://262.ecma-international.org/15.0/#sec-stringpad

module.exports = function StringPad(S, maxLength, fillString, placement) {
	if (typeof S !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a String');
	}
	if (!isInteger(maxLength) || maxLength < 0) {
		throw new $TypeError('Assertion failed: `maxLength` must be a non-negative integer');
	}
	if (typeof fillString !== 'string') {
		throw new $TypeError('Assertion failed: `fillString` must be a String');
	}
	if (placement !== START && placement !== END && placement !== 'START' && placement !== 'END') {
		throw new $TypeError('Assertion failed: `placement` must be `' + START + '` or `' + END + '`');
	}

	var stringLength = S.length; // step 1

	if (maxLength <= stringLength) { return S; } // step 2

	if (fillString === '') { return S; } // step 3

	var fillLen = maxLength - stringLength; // step 4

	// 5. Let _truncatedStringFiller_ be the String value consisting of repeated concatenations of _fillString_ truncated to length _fillLen_.
	var truncatedStringFiller = '';
	while (truncatedStringFiller.length < fillLen) {
		truncatedStringFiller += fillString;
	}
	truncatedStringFiller = $strSlice(truncatedStringFiller, 0, fillLen);

	if (placement === START || placement === 'START') { return truncatedStringFiller + S; } // step 6

	return S + truncatedStringFiller; // step 7
};
