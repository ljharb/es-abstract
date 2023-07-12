'use strict';

var $TypeError = require('es-errors/type');

var IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
var IsViewOutOfBounds = require('./IsViewOutOfBounds');

var isDataViewWithBufferWitnessRecord = require('../helpers/records/data-view-with-buffer-witness-record');

var dataViewBuffer = require('data-view-buffer');
var callBound = require('call-bind/callBound');

var $byteOffset = callBound('DataView.prototype.byteOffset', true);
var $byteLength = callBound('DataView.prototype.byteLength', true);

// https://262.ecma-international.org/15.0/#sec-getviewbytelength

module.exports = function GetViewByteLength(viewRecord) {
	if (!isDataViewWithBufferWitnessRecord(viewRecord)) {
		throw new $TypeError('Assertion failed: `viewRecord` must be a DataView with Buffer Witness Record');
	}

	if (IsViewOutOfBounds(viewRecord)) {
		throw new $TypeError('Assertion failed: `viewRecord` is out of bounds'); // step 1
	}

	var view = viewRecord['[[Object]]']; // step 2

	var viewByteLength = $byteLength(view); // view.[[ByteLength]]
	if (viewByteLength !== 'AUTO') {
		return viewByteLength; // step 3
	}

	if (IsFixedLengthArrayBuffer(dataViewBuffer(view))) {
		throw new $TypeError('Assertion failed: DataView’s ArrayBuffer is not fixed length'); // step 4
	}

	var byteOffset = $byteOffset(view); // step 5

	var byteLength = viewRecord['[[CachedBufferByteLength]]']; // step 6

	if (byteLength === 'DETACHED') {
		throw new $TypeError('Assertion failed: DataView’s ArrayBuffer is detached'); // step 7
	}

	return byteLength - byteOffset; // step 8
};
