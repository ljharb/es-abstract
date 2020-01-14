'use strict';

var GetIntrinsic = require('../GetIntrinsic');

var callBind = require('./callBind');
var callBound = require('./callBound');

var $pushApply = callBind.apply(GetIntrinsic('%Array.prototype.push%'));
var $SymbolValueOf = callBound('Symbol.prototype.valueOf', true);
var $gOPS = $SymbolValueOf ? GetIntrinsic('%Object.getOwnPropertySymbols%') : null;

var keys = require('object-keys');

module.exports = function OwnPropertyKeys(source) {
	var ownKeys = keys(source);
	if ($gOPS) {
		$pushApply(ownKeys, $gOPS(source));
	}
	return ownKeys;
};
