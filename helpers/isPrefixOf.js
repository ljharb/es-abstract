'use strict';

var $strSlice = require('call-bound')('String.prototype.slice');

/** @type {(prefix: string, string: string) => boolean} */
module.exports = function isPrefixOf(prefix, string) {
	if (prefix === string) {
		return true;
	}
	if (prefix.length > string.length) {
		return false;
	}
	return $strSlice(string, 0, prefix.length) === prefix;
};
