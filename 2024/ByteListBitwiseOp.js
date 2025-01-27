'use strict';

var $TypeError = require('es-errors/type');

var IsArray = require('./IsArray');

var Enum = require('../helpers/enum');
var isByteValue = require('../helpers/isByteValue');

var amp = Enum.define('&');
var pipe = Enum.define('|');
var caret = Enum.define('^');

var ops = [amp, pipe, caret];

// https://262.ecma-international.org/12.0/#sec-bytelistbitwiseop

module.exports = function ByteListBitwiseOp(op, xBytes, yBytes) {
	var opEnum = Enum.validate('op', ops, op);

	if (!IsArray(xBytes) || !IsArray(yBytes) || xBytes.length !== yBytes.length) {
		throw new $TypeError('Assertion failed: `xBytes` and `yBytes` must be same-length sequences of byte values (an integer 0-255, inclusive)');
	}

	var result = [];

	for (var i = 0; i < xBytes.length; i += 1) {
		var xByte = xBytes[i];
		var yByte = yBytes[i];
		if (!isByteValue(xByte) || !isByteValue(yByte)) {
			throw new $TypeError('Assertion failed: `xBytes` and `yBytes` must be same-length sequences of byte values (an integer 0-255, inclusive)');
		}
		var resultByte;
		if (opEnum === amp) {
			resultByte = xByte & yByte;
		} else if (opEnum === caret) {
			resultByte = xByte ^ yByte;
		} else {
			resultByte = xByte | yByte;
		}
		result[result.length] = resultByte;
	}

	return result;
};
