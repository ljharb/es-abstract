'use strict';

var $TypeError = require('es-errors/type');

var ArrayBufferByteLength = require('./ArrayBufferByteLength');
var IsDetachedBuffer = require('./IsDetachedBuffer');

var specEnum = require('../helpers/specEnum');

var isTypedArray = require('is-typed-array');
var typedArrayBuffer = require('typed-array-buffer');

var year = require('./year');

var SEQ_CST = specEnum(year, 'seq-cst');
var UNORDERED = specEnum(year, 'unordered');
var DETACHED = specEnum(year, 'detached');

// https://262.ecma-international.org/15.0/#sec-maketypedarraywithbufferwitnessrecord

module.exports = function MakeTypedArrayWithBufferWitnessRecord(obj, order) {
	if (!isTypedArray(obj)) {
		throw new $TypeError('Assertion failed: `obj` must be a Typed Array');
	}
	if (order !== SEQ_CST && order !== UNORDERED) {
		throw new $TypeError('Assertion failed: `order` must be `' + SEQ_CST + '` or `' + UNORDERED + '`');
	}

	var buffer = typedArrayBuffer(obj); // step 1

	var byteLength = IsDetachedBuffer(buffer) ? DETACHED : ArrayBufferByteLength(buffer, order); // steps 2 - 3

	return { '[[Object]]': obj, '[[CachedBufferByteLength]]': byteLength }; // step 4
};
