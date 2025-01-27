'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('./MakeTypedArrayWithBufferWitnessRecord');

var isTypedArray = require('is-typed-array');

var Enum = require('../helpers/enum');

var seqCST = Enum.define('SEQ-CST');
var unordered = Enum.define('UNORDERED');
var orders = [seqCST, unordered];

// https://262.ecma-international.org/15.0/#sec-validatetypedarray

module.exports = function ValidateTypedArray(O, order) {
	Enum.validate('order', orders, order);

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
