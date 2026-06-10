'use strict';

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var UINT8 = specEnum(year, 'uint8');
var UINT8C = specEnum(year, 'uint8c');
var UINT16 = specEnum(year, 'uint16');
var UINT32 = specEnum(year, 'uint32');
var BIGUINT64 = specEnum(year, 'biguint64');

// https://262.ecma-international.org/11.0/#sec-isunsignedelementtype

module.exports = function IsUnsignedElementType(type) {
	return type === UINT8
		|| type === UINT8C
		|| type === UINT16
		|| type === UINT32
		|| type === BIGUINT64;
};
