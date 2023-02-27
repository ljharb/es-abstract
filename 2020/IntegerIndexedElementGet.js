'use strict';

var $TypeError = require('es-errors/type');

var GetValueFromBuffer = require('./GetValueFromBuffer');
var IsDetachedBuffer = require('./IsDetachedBuffer');
var IsValidIntegerIndex = require('./IsValidIntegerIndex');

var typedArrayLength = require('typed-array-length');
var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');
var whichTypedArray = require('which-typed-array');

var tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/11.0/#sec-integerindexedelementget

/** @type {(O: import('../types').TypedArray, index: import('../types').nonNegativeInteger) => undefined | ReturnType<GetValueFromBuffer>} */
module.exports = function IntegerIndexedElementGet(O, index) {
	var arrayTypeName = whichTypedArray(O); // step 7
	if (!arrayTypeName) {
		throw new $TypeError('`O` must be a TypedArray'); // step 1
	}

	if (typeof index !== 'number') {
		throw new $TypeError('`index` must be a Number'); // step 2
	}

	var buffer = typedArrayBuffer(O); // step 3

	if (IsDetachedBuffer(buffer)) {
		throw new $TypeError('`O` has a detached buffer'); // step 4
	}

	if (!IsValidIntegerIndex(O, index)) {
		return void undefined; // step 5
	}

	var offset = typedArrayByteOffset(O); // step 6

	var length = typedArrayLength(O); // step 7

	if (index < 0 || index >= length) {
		return void undefined; // step 8
	}

	// eslint-disable-next-line no-extra-parens
	var elementType = tableTAO.name[/** @type {`$${typeof arrayTypeName}`} */ ('$' + arrayTypeName)]; // step 10

	// eslint-disable-next-line no-extra-parens
	var elementSize = tableTAO.size[/** @type {`$${typeof elementType}`} */ ('$' + elementType)]; // step 8

	var indexedPosition = (index * elementSize) + offset; // step 9

	return GetValueFromBuffer(buffer, indexedPosition, elementType, true, 'Unordered'); // step 11
};
