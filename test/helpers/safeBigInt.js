'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);

var MAX_SAFE_INTEGER = require('../../helpers/maxSafeInteger');

// node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
var needsBigIntHack = false;
if ($BigInt) {
	try {
		$BigInt(Math.pow(2, 64));
	} catch (e) {
		needsBigIntHack = true;
	}
}

module.exports = needsBigIntHack ? function (int) {
	if (int > MAX_SAFE_INTEGER || -int > MAX_SAFE_INTEGER) {
		// construct a maximum-precision string of digits
		// from a native serialization like <digits>.<zeroes> or <digit>.<digits>e+<exponent>
		var preciseParts = Number(int).toPrecision(100).split('e');
		var significand = preciseParts[0].replace(/(\.[0-9]*?)0*$/, '$1');
		var baseTenExponent = Number(preciseParts[1] || 0);
		if (baseTenExponent > 0) {
			var significandScale = (significand + '.').indexOf('.');
			baseTenExponent -= significand.length - 1 - significandScale;
		}
		var digits = significand.replace('.', '') + Array(baseTenExponent + 1).join('0');
		return eval(digits + 'n'); // eslint-disable-line no-eval
	}
	return $BigInt(int);
} : $BigInt;
