'use strict';

var $TypeError = require('es-errors/type');

var $byteLength = require('array-buffer-byte-length');
var availableTypedArrays = require('available-typed-arrays')();
var callBound = require('call-bound');
var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');

// eslint-disable-next-line no-extra-parens
var $sabByteLength = /** @type {(receiver: SharedArrayBuffer) => number} */ (callBound('SharedArrayBuffer.prototype.byteLength', true));

// https://262.ecma-international.org/8.0/#sec-isdetachedbuffer

/** @type {(arrayBuffer: ArrayBuffer | SharedArrayBuffer) => boolean} */
module.exports = function IsDetachedBuffer(arrayBuffer) {
	var byteLength;
	if (isSharedArrayBuffer(arrayBuffer)) {
		byteLength = $sabByteLength(arrayBuffer);
	} else if (isArrayBuffer(arrayBuffer)) {
		byteLength = $byteLength(arrayBuffer);
	} else {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an Object with an [[ArrayBufferData]] internal slot');
	}

	if (availableTypedArrays.length === 0) {
		return false;
	}
	if (byteLength === 0) {
		try {
			new global[availableTypedArrays[0]](arrayBuffer); // eslint-disable-line no-new
		} catch (error) {
			// eslint-disable-next-line no-extra-parens
			return !!error && /** @type {{ name?: unknown }} */ (error).name === 'TypeError';
		}
	}
	return false;
};
