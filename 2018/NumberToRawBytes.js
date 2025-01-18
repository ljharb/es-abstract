// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');

var hasOwnProperty = require('./HasOwnProperty');
var ToInt16 = require('./ToInt16');
var ToInt32 = require('./ToInt32');
var ToInt8 = require('./ToInt8');
var ToUint16 = require('./ToUint16');
var ToUint32 = require('./ToUint32');
var ToUint8 = require('./ToUint8');
var ToUint8Clamp = require('./ToUint8Clamp');

var valueToFloat32Bytes = require('../helpers/valueToFloat32Bytes');
var valueToFloat64Bytes = require('../helpers/valueToFloat64Bytes');
var integerToNBytes = require('../helpers/integerToNBytes');

var tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/8.0/#table-50

/** @typedef {import('../types').WithoutPrefix<keyof typeof tableTAO.size, '$'>} TAType */

var TypeToAO = {
	__proto__: null,
	$Int8: ToInt8,
	$Uint8: ToUint8,
	$Uint8C: ToUint8Clamp,
	$Int16: ToInt16,
	$Uint16: ToUint16,
	$Int32: ToInt32,
	$Uint32: ToUint32
};

// https://262.ecma-international.org/8.0/#sec-numbertorawbytes

/** @type {(type: TAType, value: number, isLittleEndian: boolean) => import('../types').ByteValue[]} */
module.exports = function NumberToRawBytes(type, value, isLittleEndian) {
	if (typeof type !== 'string' || !hasOwnProperty(tableTAO.size, '$' + type)) {
		throw new $TypeError('Assertion failed: `type` must be a TypedArray element type');
	}
	if (typeof value !== 'number') {
		throw new $TypeError('Assertion failed: `value` must be a Number');
	}
	if (typeof isLittleEndian !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a Boolean');
	}

	if (type === 'Float32') { // step 1
		return valueToFloat32Bytes(value, isLittleEndian);
	} else if (type === 'Float64') { // step 2
		return valueToFloat64Bytes(value, isLittleEndian);
	} // step 3

	var n = tableTAO.size[/** @type {`$${typeof type}`} */ ('$' + type)]; // step 3.a

	var convOp = TypeToAO[/** @type {`$${typeof type}`} */ ('$' + type)]; // step 3.b

	var intValue = convOp(value); // step 3.c

	return integerToNBytes(intValue, n, isLittleEndian); // step 3.d, 3.e, 4
};
