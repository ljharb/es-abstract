'use strict';

var hasBigInts = require('has-bigints')();

var $BigInt = hasBigInts ? BigInt : null;

module.exports = function unserializeNumeric(x) {
	if (typeof x === 'string') {
		return x.charAt(x.length - 1) === 'n' ? $BigInt(x.slice(0, -1)) : Number(x);
	}
	return x;
};
