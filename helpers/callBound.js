'use strict';

var GetIntrinsic = require('../GetIntrinsic');
var callBind = require('./callBind');

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function') {
		return callBind(intrinsic);
	}
	return intrinsic;
};
