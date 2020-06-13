'use strict';

var GetIntrinsic = require('../GetIntrinsic');

var $isArray = GetIntrinsic('%Array.isArray%', true);

// eslint-disable-next-line global-require
var toStr = !$isArray && require('../helpers/callBound')('%Object.prototype.toString%');

// https://www.ecma-international.org/ecma-262/6.0/#sec-isarray

module.exports = $isArray || function IsArray(argument) {
	return toStr(argument) === '[object Array]';
};
