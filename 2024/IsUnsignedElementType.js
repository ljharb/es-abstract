'use strict';

var Enum = require('../helpers/enum');

// https://262.ecma-international.org/15.0/#sec-isunsignedelementtype

module.exports = function IsUnsignedElementType(type) {
	var typeEnum = Enum(type);
	return typeEnum === Enum('UINT8')
		|| typeEnum === Enum('UINT8C')
		|| typeEnum === Enum('UINT16')
		|| typeEnum === Enum('UINT32')
		|| typeEnum === Enum('BIGUINT64');
};
