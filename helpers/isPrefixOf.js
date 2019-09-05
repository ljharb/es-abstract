'use strict';

var GetIntrinsic = require('../GetIntrinsic');

var $String = GetIntrinsic('%String%');

var callBind = require('../helpers/callBind');
var strSlice = callBind($String.prototype.slice);

module.exports = function isPrefixOf(prefix, string) {
	if (prefix === string) {
		return true;
	}
	if (prefix.length > string.length) {
		return false;
	}
	return strSlice(string, 0, prefix.length) === prefix;
};
