'use strict';

var IsUnclampedIntegerElementType = require('./IsUnclampedIntegerElementType');
var IsBigIntElementType = require('./IsBigIntElementType');

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var INIT = specEnum(year, 'init');
var UNORDERED = specEnum(year, 'unordered');

// https://262.ecma-international.org/11.0/#sec-isnotearconfiguration

module.exports = function IsNoTearConfiguration(type, order) {
	if (IsUnclampedIntegerElementType(type)) {
		return true;
	}
	if (IsBigIntElementType(type) && order !== INIT && order !== UNORDERED) {
		return true;
	}
	return false;
};
