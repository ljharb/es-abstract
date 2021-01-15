'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $pow = GetIntrinsic('%Math.pow%');

var ToBigInt = require('./ToBigInt');
var BigIntRemainder = require('./BigInt/remainder');

var modBigInt = require('../helpers/modBigInt');

var twoSixtyFour = $BigInt && $BigInt($pow(2, 64));

// https://262.ecma-international.org/11.0/#sec-tobiguint64

module.exports = function ToBigUint64(argument) {
	var n = ToBigInt(argument);
	var int64bit = modBigInt(BigIntRemainder, n, twoSixtyFour);
	return int64bit;
};
