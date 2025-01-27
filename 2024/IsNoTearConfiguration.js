'use strict';

var IsUnclampedIntegerElementType = require('./IsUnclampedIntegerElementType');
var IsBigIntElementType = require('./IsBigIntElementType');

var Enum = require('../helpers/enum');

var init = Enum.define('INIT');
var unordered = Enum.define('UNORDERED');
// var seqCST = Enum.define('SEQCST');
// var orders = [init, unordered, seqCST];

// https://262.ecma-international.org/15.0/#sec-isnotearconfiguration

module.exports = function IsNoTearConfiguration(type, order) {
	// Enum.validate('order', orders, order);

	if (IsUnclampedIntegerElementType(type)) {
		return true;
	}
	var orderEnum = Enum(order);
	if (IsBigIntElementType(type) && orderEnum !== init && orderEnum !== unordered) {
		return true;
	}
	return false;
};
