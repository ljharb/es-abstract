'use strict';

var Enum = require('../helpers/enum');

// https://262.ecma-international.org/11.0/#sec-isunsignedelementtype

module.exports = function IsUnsignedElementType(type) {
	var typeEnum = Enum(type);
	return typeEnum === Enum('Uint8')
		|| typeEnum === Enum('Uint8C')
		|| typeEnum === Enum('Uint16')
		|| typeEnum === Enum('Uint32')
		|| typeEnum === Enum('BigUint64');
};
