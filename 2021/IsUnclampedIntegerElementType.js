'use strict';

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var INT8 = specEnum(year, 'int8');
var UINT8 = specEnum(year, 'uint8');
var INT16 = specEnum(year, 'int16');
var UINT16 = specEnum(year, 'uint16');
var INT32 = specEnum(year, 'int32');
var UINT32 = specEnum(year, 'uint32');

// https://262.ecma-international.org/11.0/#sec-isunclampedintegerelementtype

module.exports = function IsUnclampedIntegerElementType(type) {
	return type === INT8
		|| type === UINT8
		|| type === INT16
		|| type === UINT16
		|| type === INT32
		|| type === UINT32;
};
