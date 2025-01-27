'use strict';

var Enum = require('../helpers/enum');

// https://262.ecma-international.org/15.0/#sec-isbigintelementtype

module.exports = function IsBigIntElementType(type) {
	var typeEnum = Enum(type);
	return typeEnum === Enum('BIGUINT64') || typeEnum === Enum('BIGINT64');
};
