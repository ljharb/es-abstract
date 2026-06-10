'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('./MakeTypedArrayWithBufferWitnessRecord');

var specEnum = require('../helpers/specEnum');

var isTypedArray = require('is-typed-array');

var year = require('./year');

var SEQ_CST = specEnum(year, 'seq-cst');
var UNORDERED = specEnum(year, 'unordered');

// https://262.ecma-international.org/15.0/#sec-validatetypedarray

module.exports = function ValidateTypedArray(O, order) {
	if (order !== SEQ_CST && order !== UNORDERED) {
		throw new $TypeError('Assertion failed: `order` must be `' + SEQ_CST + '` or `' + UNORDERED + '`');
	}

	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: `O` must be an Object'); // step 1
	}
	if (!isTypedArray(O)) {
		throw new $TypeError('Assertion failed: `O` must be a Typed Array'); // steps 1 - 2
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(O, order); // step 3

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('`O` must be in-bounds and backed by a non-detached buffer'); // step 4
	}

	return taRecord; // step 5
};
