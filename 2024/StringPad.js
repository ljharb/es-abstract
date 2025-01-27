'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bound');
var isInteger = require('math-intrinsics/isInteger');

var $strSlice = callBound('String.prototype.slice');

var Enum = require('../helpers/enum');

var start = Enum.define('start', ['START']);
var end = Enum.define('end', ['END']);
var placements = [start, end, 'START', 'END'];

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
	var placementEnum = Enum.validate('placement', placements, placement);

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

	if (placementEnum === start) {
		return truncatedStringFiller + S; // step 6
	}

	return S + truncatedStringFiller; // step 7
};
