'use strict';

var GetIntrinsic = require('get-intrinsic');

var $String = GetIntrinsic('%String%');
var $RangeError = require('es-errors/range');
var isInteger = require('math-intrinsics/isInteger');

var StringPad = require('./StringPad');

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var START = specEnum(year, 'start');

// https://262.ecma-international.org/13.0/#sec-tozeropaddeddecimalstring

module.exports = function ToZeroPaddedDecimalString(n, minLength) {
	if (!isInteger(n) || n < 0) {
		throw new $RangeError('Assertion failed: `n` must be a non-negative integer');
	}
	var S = $String(n);
	return StringPad(S, minLength, '0', START);
};
