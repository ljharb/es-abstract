'use strict';

var $TypeError = require('es-errors/type');

var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var IsViewOutOfBounds = require('./IsViewOutOfBounds');
var MakeDataViewWithBufferWitnessRecord = require('./MakeDataViewWithBufferWitnessRecord');
var MakeTypedArrayWithBufferWitnessRecord = require('./MakeTypedArrayWithBufferWitnessRecord');

var isDataView = require('is-data-view');
var isTypedArray = require('is-typed-array');

// https://262.ecma-international.org/15.0/#sec-isarraybufferviewoutofbounds

/** @type {(O: import('../types').TypedArray | DataView) => boolean} */
module.exports = function IsArrayBufferViewOutOfBounds(O) {
	if (!isTypedArray(O) && !isDataView(O)) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray or DataView');
	}

	if (isDataView(O)) { // step 1
		var viewRecord = MakeDataViewWithBufferWitnessRecord(O, 'SEQ-CST'); // step 1.a

		return IsViewOutOfBounds(viewRecord); // step 1.b
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(O, 'SEQ-CST'); // step 2

	return IsTypedArrayOutOfBounds(taRecord); // step 3
};
