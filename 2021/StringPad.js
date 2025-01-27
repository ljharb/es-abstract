'use strict';

var callBound = require('call-bound');

var ToLength = require('./ToLength');
var ToString = require('./ToString');

var $strSlice = callBound('String.prototype.slice');

var Enum = require('../helpers/enum');

var start = Enum.define('start');
var end = Enum.define('end');
var placements = [start, end];

// https://262.ecma-international.org/11.0/#sec-stringpad

module.exports = function StringPad(O, maxLength, fillString, placement) {
	var placementEnum = Enum.validate('placement', placements, placement); // step 1

	var S = ToString(O); // step 2
	var intMaxLength = ToLength(maxLength); // step 3
	var stringLength = S.length; // step 4
	if (intMaxLength <= stringLength) {
		return S; // step 5
	}
	var filler = typeof fillString === 'undefined' ? ' ' : ToString(fillString); // step 6, 7
	if (filler === '') {
		return S; // step 8
	}
	var fillLen = intMaxLength - stringLength; // step 9

	// the String value consisting of repeated concatenations of filler truncated to length fillLen.
	var truncatedStringFiller = '';
	while (truncatedStringFiller.length < fillLen) {
		truncatedStringFiller += filler;
	}
	truncatedStringFiller = $strSlice(truncatedStringFiller, 0, fillLen); // step 10

	if (placementEnum === start) {
		return truncatedStringFiller + S; // step 11
	}
	return S + truncatedStringFiller; // step 12
};
