'use strict';

var GetIntrinsic = require('get-intrinsic');

var $Number = GetIntrinsic('%Number%');
var $BigInt = GetIntrinsic('%BigInt%', true);

/** @type {<T extends number | bigint>(intValue: T, n: number, isLittleEndian: boolean) => import('../types').ByteValue[]} */
module.exports = function integerToNBytes(intValue, n, isLittleEndian) {

	var Z = typeof intValue === 'bigint' ? /** @type {NonNullable<typeof $BigInt>} */ ($BigInt) : $Number;
	/*
	if (intValue >= 0) { // step 3.d
		// Let rawBytes be a List containing the n-byte binary encoding of intValue. If isLittleEndian is false, the bytes are ordered in big endian order. Otherwise, the bytes are ordered in little endian order.
	} else { // step 3.e
		// Let rawBytes be a List containing the n-byte binary 2's complement encoding of intValue. If isLittleEndian is false, the bytes are ordered in big endian order. Otherwise, the bytes are ordered in little endian order.
	}
    */
	if (intValue < 0) {
		// @ts-expect-error TS can't figure out that Z produces the same type as intValue
		intValue >>>= Z(0); // eslint-disable-line no-param-reassign
	}

	/** @type {import('../types').ByteValue[]} */
	var rawBytes = [];
	for (var i = 0; i < n; i++) {
		rawBytes[isLittleEndian ? i : n - 1 - i] = /** @type {import('../types').ByteValue} */ (Number(intValue) & 0xFF);
		// @ts-expect-error TS can't figure out that Z produces the same type as intValue
		intValue >>= Z(8); // eslint-disable-line no-param-reassign
	}

	return rawBytes; // step 4
};
