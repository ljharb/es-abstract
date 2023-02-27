'use strict';

var hasBigInts = require('has-bigints')();

var $BigInt = hasBigInts ? BigInt : null;

/** @type {(x: number | string) => number | bigint} */
module.exports = function unserializeNumeric(x) {
	if (typeof x === 'string') {
		// @ts-expect-error it's supposed to throw if there's no bigints and you try to unserialize a bigint
		return x.charAt(x.length - 1) === 'n' ? $BigInt(x.slice(0, -1)) : Number(x);
	}
	return x;
};
