'use strict';

var callBound = require('../helpers/callBound');

var $strSlice = callBound('String.prototype.slice');

module.exports = function padLeft(c, count) {
	return $strSlice('00000000000000' + c, -(count || 2));
};
