'use strict';

var callBound = require('call-bound');

var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

var $charAt = callBound('String.prototype.charAt');
var $reverse = callBound('Array.prototype.reverse');
var $slice = callBound('Array.prototype.slice');

var IsArray = require('./IsArray');

var bytesAsFloat32 = require('../helpers/bytesAsFloat32');
var bytesAsFloat64 = require('../helpers/bytesAsFloat64');
var bytesAsInteger = require('../helpers/bytesAsInteger');
var Enum = require('../helpers/enum');
var every = require('../helpers/every');
var isByteValue = require('../helpers/isByteValue');

var tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/8.0/#sec-rawbytestonumber

module.exports = function RawBytesToNumber(type, rawBytes, isLittleEndian) {
	var typeEnum = Enum.validate('type', tableTAO.types, type);

	if (!IsArray(rawBytes) || !every(rawBytes, isByteValue)) {
		throw new $TypeError('Assertion failed: `rawBytes` must be an Array of bytes');
	}
	if (typeof isLittleEndian !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a Boolean');
	}

	var elementSize = tableTAO.size['$' + typeEnum.name]; // step 1

	if (rawBytes.length !== elementSize) {
		// this assertion is not in the spec, but it'd be an editorial error if it were ever violated
		throw new $RangeError('Assertion failed: `rawBytes` must have a length of ' + elementSize + ' for type ' + typeEnum.name);
	}

	// eslint-disable-next-line no-param-reassign
	rawBytes = $slice(rawBytes, 0, elementSize);
	if (!isLittleEndian) {
		$reverse(rawBytes); // step 2
	}

	if (typeEnum === Enum('Float32')) { // step 3
		return bytesAsFloat32(rawBytes);
	}

	if (typeEnum === Enum('Float64')) { // step 4
		return bytesAsFloat64(rawBytes);
	}

	return bytesAsInteger(rawBytes, elementSize, $charAt(typeEnum.name, 0) === 'U', false);
};
