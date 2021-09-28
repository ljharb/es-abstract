'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);

var ToBigInt = require('./ToBigInt');
var BigIntRemainder = require('./BigInt/remainder');

var modBigInt = require('../helpers/modBigInt');

var MAX_SAFE_INTEGER = require('../helpers/maxSafeInteger');

// BigInt(2**63), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
var twoSixtyThree = $BigInt && ((BigInt(MAX_SAFE_INTEGER) * BigInt(1024)) + BigInt(1024));

// BigInt(2**64), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
var twoSixtyFour = $BigInt && ((BigInt(MAX_SAFE_INTEGER) * BigInt(2048)) + BigInt(2048));

// https://262.ecma-international.org/11.0/#sec-tobigint64

module.exports = function ToBigInt64(argument) {
	var n = ToBigInt(argument);
	var int64bit = modBigInt(BigIntRemainder, n, twoSixtyFour);
	return int64bit >= twoSixtyThree ? int64bit - twoSixtyFour : int64bit;
};
