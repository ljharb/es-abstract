'use strict';

var GetIntrinsic = require('get-intrinsic');

var $pow = require('math-intrinsics/pow');

var $Number = GetIntrinsic('%Number%');
var $BigInt = GetIntrinsic('%BigInt%', true);

/** @type {import('../types').BytesAsInteger} */
module.exports = function bytesAsInteger(rawBytes, elementSize, isUnsigned, isBigInt) {

	var Z = isBigInt ? /** @type {NonNullable<typeof $BigInt>} */ ($BigInt) : $Number;

	// this is common to both branches
	var intValue = Z(0);
	for (var i = 0; i < rawBytes.length; i++) {
		// @ts-expect-error the types of `intValue` and the return value of `Z` are the same
		intValue += Z(rawBytes[i] * $pow(2, 8 * i));
	}
	/*
	Let intValue be the byte elements of rawBytes concatenated and interpreted as a bit string encoding of an unsigned little-endian binary number.
	*/

	if (!isUnsigned) { // steps 5-6
		// Let intValue be the byte elements of rawBytes concatenated and interpreted as a bit string encoding of a binary little-endian 2's complement number of bit length elementSize × 8.
		var bitLength = elementSize * 8;

		if (rawBytes[elementSize - 1] & 0x80) {
			// @ts-expect-error the types of `intValue` and the return value of `Z` are the same
			intValue -= Z($pow(2, bitLength));
		}
	}

	return intValue; // step 7
};
